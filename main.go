/**********Radiation Oncology****************/
// Date: Dec 2018
// Author: Jeff
// Authorized by Prof.Watkins
/**********Radiation Oncology****************/

package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"math"
	"net/http"
	"strconv"
	"strings"

	_ "github.com/denisenkom/go-mssqldb"
)

type Data struct {
	OrganList []string
	DDVHarray [5][][][]float64
}

const MaxFloat64 = 1.797693134862315708145274237317043567981e+308

func main() {
	//render index.html
	http.Handle("/", http.StripPrefix("/", http.FileServer(http.Dir("./client"))))

	//patient_list is for generating dynamic patient lists and send to front-end
	http.HandleFunc("/patient_list", generatePatientListHandler)

	//data is after selecting button, sending organ lists and ddvh lines for front-end
	http.HandleFunc("/data", generateLinesOrgansHandler)

	//testDatabase is a database connector API
	http.HandleFunc("/testDatabase", testDatabaseHandler)

	//test is for tradeoff function - need calculate cor-cof based on prevArray
	http.HandleFunc("/test", tradeOffHanlder)
	http.ListenAndServe(":8080", nil)
}

/*----------------------------------------------Dynamic patient list------------------------------------------*/
//this handler can generate dynamic patient lists according to the patient folder
func generatePatientListHandler(w http.ResponseWriter, r *http.Request) {
	//get callback parameter for ajax communication
	callback := r.FormValue("callback")

	//traverse into the patient data folder to generate dynamic patient lists
	filenames := []string{}
	files, err := ioutil.ReadDir("./client/patient_data/qcMCO/")
	if err != nil {
		log.Fatal(err)
	}

	for _, file := range files {
		if strings.HasPrefix(file.Name(), "Patient") {
			filenames = append(filenames, file.Name())
		}
	}

	//encode to json format for ajax communication
	jsonFileNames, _ := json.Marshal(filenames)

	fmt.Fprintln(w, callback+"("+string(jsonFileNames)+")")
}

/*----------------------------------------------Dynamic patient list------------------------------------------*/

/*--------------------transfer dynamic organs and ddvh lines data to front-end--------------------------------*/
//using ajax to communicate with front-end
//this handler can generate ddvh lines and dynamic organs for selected patient
//rely on two functions - generateLines and generateOrganLists
func generateLinesOrgansHandler(w http.ResponseWriter, r *http.Request) {
	//get callback parameter for ajax communication
	callback := r.FormValue("callback")

	//get patient information from ajax communication
	patient := r.FormValue("value")

	//1 - generate lines
	lines := generateLines(patient)

	//2 - generate dynamic organ list
	organ := generateOrgansList(patient)

	//combine 1 and 2 into a struct
	res := Data{OrganList: organ, DDVHarray: lines}

	resJson, _ := json.Marshal(res)

	fmt.Fprintln(w, callback+"("+string(resJson)+")")
}

/*--------------------transfer dynamic organs and ddvh lines data to front-end--------------------------------*/

/*--------------------------------------------Read DDVH data file----------------------------------------------*/
//function to read ddvh file for a selected patient
func generateLines(patient string) [5][][][]float64 {
	lines := [5][][][]float64{}
	//need to be dynamic here - directly call the following functions to dynamic generate organ and plan lists
	organs := []string{"Heart", "Lt_Lung", "Rt_Lung", "Esophagus", "PTV"}
	planParts := []string{"CRT_3D.", "CRT_con.", "CRT_Esop.", "CRT_Heart.", "CRT_ips.", "IMRT_9B.",
		"IMRT_con.", "IMRT_Esop.", "IMRT_Heart.", "NCP_27B_con.", "NCP_27B_Esop.", "NCP_27B_Heart.",
		"NCP_27B_ips.", "NCP_27B.", "NCP_Arc_con.", "NCP_Arc_esop.", "NCP_Arc_heart.", "NCP_Arc_ips."}

	path := "./client/patient_data/qcMCO/" + patient + "/"
	// path := "./client/patient_data/qcMCO/Patient_5/"
	ftype := ".ddvh"

	//for each organ, each plan, loop for reading ddvh file
	for i, organ := range organs {
		for _, plan := range planParts {
			filename := path + plan + organ + ftype

			content, err := ioutil.ReadFile(filename)
			if err != nil {
				temp := [][]float64{}
				lines[i] = append(lines[i], temp)
			} else {
				str := strings.Split(string(content), "\n")
				num, _ := strconv.ParseInt(str[0], 10, 64)

				temp := [][]float64{}

				for k := 1; k <= int(num); k++ {
					dataPoint := strings.Split(str[k], " ")
					value1, _ := strconv.ParseFloat(dataPoint[0], 64)
					value2, _ := strconv.ParseFloat(dataPoint[1], 64)
					dataPointSlice := []float64{value1, value2}
					temp = append(temp, dataPointSlice)
				}

				lines[i] = append(lines[i], temp)
			}
		}
	}
	return lines
}

/*--------------------------------------------Read DDVH data file----------------------------------------------*/

/*---------------------------------------Database Connector API-------------------------------------*/
//test for database connection
func testDatabaseHandler(w http.ResponseWriter, r *http.Request) {
	dsn := "server=2UA232T610;user id=pinnuser;password=pinnuser1;database=OncospaceLocallyAdvancedLung"
	db, err := sql.Open("mssql", dsn)
	if err != nil {
		fmt.Println("Cannot connect: ", err.Error())
		return
	}
	err = db.Ping()
	if err != nil {
		fmt.Println("Cannot connect: ", err.Error())
		return
	}
	defer db.Close()

	fmt.Println("successful!")

	q := `select * from DVHData`

	rows, err := db.Query(q)
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()

	i := 0

	for rows.Next() {
		// 	if err := rows.Scan(&id, &name); err != nil {
		// 		log.Fatal(err)
		// 	}
		// 	fmt.Printf("id %d name is %s\n", id, name)
		// }
		var (
			x string
			y string
			z string
			t string
		)
		if err := rows.Scan(&x, &y, &z, &t); err != nil {
			log.Fatal(err)
		}

		fmt.Fprintln(w, x, y, z, t)

		i = i + 1
		if i > 9 {
			break
		}
	}
}

/*---------------------------------------Database Connector API-------------------------------------*/

/*-------------------Dynamic Organ lists and Plan lists------------------------------*/
//function to generate dynamic organ for selected patient
func generateOrgansList(patient string) []string {

	//prepare for filtering organ names
	filterMap := make(map[string]string)
	filterMap["Esophagus"] = "Esophagus"
	filterMap["esophagus"] = "Esophagus"
	filterMap["External"] = "External"
	filterMap["Heart"] = "Heart"
	filterMap["heart"] = "Heart"
	filterMap["total_lung_-_GTV"] = "Total_Lungs_-_gtv"
	filterMap["Total_Lungs_-_gtv"] = "Total_Lungs_-_gtv"
	filterMap["spinal_cord"] = "spinal_cord"
	filterMap["PTV"] = "PTV"
	filterMap["l_lung"] = "Lt_Lung"
	filterMap["Lt_Lung"] = "Lt_Lung"
	filterMap["Lt_lung"] = "Lt_Lung"
	filterMap["L_lung"] = "Lt_Lung"
	filterMap["Rt_Lung"] = "Rt_Lung"
	filterMap["R_lung"] = "Rt_Lung"
	filterMap["Rt_lung"] = "Rt_Lung"
	filterMap["r_lung"] = "Rt_Lung"

	//read directory for a selected patient
	// files, err := ioutil.ReadDir("./client/patient_data/qcMCO/Patient_5/")
	filename := "./client/patient_data/qcMCO/" + patient + "/"
	files, err := ioutil.ReadDir(filename)
	if err != nil {
		log.Fatal(err)
	}

	//use map to filter duplicate organ names
	organsMap := map[string]bool{}

	for _, file := range files {
		if strings.HasSuffix(file.Name(), ".ddvh") {
			stringCol := strings.Split(file.Name(), ".")

			_, ok := organsMap[filterMap[stringCol[1]]]
			if !ok {
				organsMap[filterMap[stringCol[1]]] = true

			}

		}
	}

	//create two slice to contain planlist and organlists
	organsList := []string{}

	for organ, _ := range organsMap {
		organsList = append(organsList, organ)
	}

	return organsList
}

//function to generate dynamic plan for selected patient
func generatePlansList(patient string) []string {
	files, err := ioutil.ReadDir("./client/patient_data/qcMCO/Patient_5/")
	if err != nil {
		log.Fatal(err)
	}

	plansMap := map[string]bool{}

	for _, file := range files {
		if strings.HasSuffix(file.Name(), ".ddvh") {
			stringCol := strings.Split(file.Name(), ".")
			_, ok := plansMap[stringCol[0]]
			if !ok {
				plansMap[stringCol[0]] = true
			}
		}
	}

	plansList := []string{}
	for plan, _ := range plansMap {
		plansList = append(plansList, plan)
	}

	return plansList
}

//function for testing tradeoff
func tradeOffHanlder(w http.ResponseWriter, r *http.Request) {
	res := tradeoff()
	for i, _ := range res {
		fmt.Fprintln(w, res[i])
	}
}

/*-------------------Dynamic Organ lists and Plan lists------------------------------*/

/*------------------------functions for tradeOff-------------------------------------*/

//function to read ddvh file for a selected patient
func tradeoff() [18][7]float64 {
	lines := [6][][][]float64{}
	organs := []string{"Heart", "Lt_Lung", "Rt_Lung", "Esophagus", "PTV", "spinal_cord"}
	planParts := []string{"CRT_3D.", "CRT_con.", "CRT_Esop.", "CRT_Heart.", "CRT_ips.", "IMRT_9B.",
		"IMRT_con.", "IMRT_Esop.", "IMRT_Heart.", "NCP_27B_con.", "NCP_27B_Esop.", "NCP_27B_Heart.",
		"NCP_27B_ips.", "NCP_27B.", "NCP_Arc_con.", "NCP_Arc_esop.", "NCP_Arc_heart.", "NCP_Arc_ips."}
	//path := "./client/patient_data/qcMCO/" + patient + "/"
	path := "./client/patient_data/qcMCO/Patient_5/"
	ftype := ".ddvh"

	//for each organ, each plan, loop for reading ddvh file
	for i, organ := range organs {
		for _, plan := range planParts {
			filename := path + plan + organ + ftype

			content, err := ioutil.ReadFile(filename)
			if err != nil {
				temp := [][]float64{}
				lines[i] = append(lines[i], temp)
			} else {
				str := strings.Split(string(content), "\n")
				num, _ := strconv.ParseInt(str[0], 10, 64)

				temp := [][]float64{}

				for k := 1; k <= int(num); k++ {
					dataPoint := strings.Split(str[k], " ")
					value1, _ := strconv.ParseFloat(dataPoint[0], 64)
					value2, _ := strconv.ParseFloat(dataPoint[1], 64)
					dataPointSlice := []float64{value1, value2}
					temp = append(temp, dataPointSlice)
				}

				lines[i] = append(lines[i], temp)
			}
		}
	}

	prevArray := [18][7]float64{}
	var meanDose float64
	var d95 float64
	var dmax float64

	for i, _ := range organs {
		for j, _ := range planParts {
			if i <= 3 {
				meanDose = calMeanDose(lines[i][j])
				prevArray[j][i] = meanDose
			} else if i == 4 {
				d95 = calD95(convertCDVH(lines[i][j]))
				prevArray[j][4] = d95
				dmax = calDmax(lines[i][j])
				prevArray[j][5] = dmax
			} else if i == 5 {
				dmax = calDmax(lines[i][j])
				prevArray[j][6] = dmax
			}
		}
	}
	return prevArray

	//we can calculate cor-cof here based on prevArray
	//------------------------------------------------
}

func calMeanDose(data [][]float64) float64 {
	var totalDose float64
	var totalVolume float64
	var dose float64
	var volume float64
	for i := 0; i < len(data); i++ {
		dose = data[i][0]
		volume = data[i][1]
		totalDose += dose * volume
		totalVolume += volume
	}
	return totalDose / totalVolume
}

//function for converting from dvh data to cdvh data
func convertCDVH(data [][]float64) [][]float64 {
	// dose := []float64{}
	// volume := []float64{}
	cdvhData := [][]float64{}
	var totalVolume float64
	sumVolume := float64(0)

	for i := 0; i < len(data); i++ {
		// dose.append(data[i][0])
		// volume.append(data[i][1])
		totalVolume += data[i][1]
	}

	for i := 0; i < len(data); i++ {
		sumVolume += data[i][1]
		tempData := []float64{data[i][0], 1 - sumVolume/totalVolume}
		cdvhData = append(cdvhData, tempData)
	}

	return cdvhData
}

//function for calculating D95 for PTV
func calD95(cdvhData [][]float64) float64 {
	minDistance := MaxFloat64
	var curDistance float64
	var finalDose float64

	for _, data := range cdvhData {
		curDistance = math.Abs(data[1] - 0.95)
		if curDistance == 0 {
			return data[0]
		} else if curDistance < minDistance {
			minDistance = curDistance
			finalDose = data[0]
		}
	}

	return finalDose
}

func calDmax(data [][]float64) float64 {
	for i := len(data) - 1; i >= 0; i-- {
		if data[i][1] > 0.03 {
			return data[i][0]
		}
	}
	return 0
}

/*------------------------functions for tradeOff-------------------------------------*/

/********************************functions for future use*****************************/

// func generateOrgansListHandler(w http.ResponseWriter, r *http.Request) {
// 	callback := r.FormValue("callback")

// 	files, err := ioutil.ReadDir("./client/patient_data/qcMCO/Patient_5/")
// 	if err != nil {
// 		log.Fatal(err)
// 	}

// 	organsMap := map[string]bool{}

// 	for _, file := range files {
// 		if strings.HasSuffix(file.Name(), ".ddvh") {
// 			stringCol := strings.Split(file.Name(), ".")

// 			_, ok := organsMap[stringCol[1]]
// 			if !ok {
// 				organsMap[stringCol[1]] = true
// 			}

// 		}
// 	}

// 	//create two slice to contain planlist and organlists
// 	organsList := []string{}

// 	for organ, _ := range organsMap {
// 		organsList = append(organsList, organ)
// 	}

// 	jsonOrgansList, _ := json.Marshal(organsList)

// 	//fmt.Fprintln(w, organsList)
// 	fmt.Fprintln(w, callback+"("+string(jsonOrgansList)+")")
// }

// func generatePlansListHandler(w http.ResponseWriter, r *http.Request) {
// 	callback := r.FormValue("callback")

// 	files, err := ioutil.ReadDir("./client/patient_data/qcMCO/Patient_5/")
// 	if err != nil {
// 		log.Fatal(err)
// 	}

// 	plansMap := map[string]bool{}

// 	for _, file := range files {
// 		if strings.HasSuffix(file.Name(), ".ddvh") {
// 			stringCol := strings.Split(file.Name(), ".")
// 			_, ok := plansMap[stringCol[0]]
// 			if !ok {
// 				plansMap[stringCol[0]] = true
// 			}
// 		}
// 	}

// 	plansList := []string{}
// 	for plan, _ := range plansMap {
// 		plansList = append(plansList, plan)
// 	}

// 	jsonPlansList, _ := json.Marshal(plansList)

// 	//fmt.Fprintln(w, plansList)
// 	fmt.Fprintln(w, callback+"("+string(jsonPlansList)+")")
// }

// func tradeOffHandler(w http.ResponseWriter, r *http.Request) {

// 	lines := [6][][][]float64{}
// 	middleData := [19][6]float64{}
// 	var meanDose float64
// 	var d95 float64
// 	var dMax float64
// 	organs := []string{"Heart", "Lt_Lung", "Rt_Lung", "Esophagus", "PTV", "spinal_cord"}
// 	planParts := []string{"CRT_3D.", "CRT_con.", "CRT_Esop.", "CRT_Heart.", "CRT_ips.", "IMRT_9B.",
// 		"IMRT_con.", "IMRT_Esop.", "IMRT_Heart.", "NCP_27B_con.", "NCP_27B_Esop.", "NCP_27B_Heart.",
// 		"NCP_27B_ips.", "NCP_27B.", "NCP_Arc_con.", "NCP_Arc_esop.", "NCP_Arc_heart.", "NCP_Arc_ips.", "NCP_Arc"}
// 	path := "./client/patient_data/qcMCO/Patient_5/"
// 	ftype := ".ddvh"

// 	for i, organ := range organs {
// 		for j, plan := range planParts {
// 			filename := path + plan + organ + ftype

// 			content, err := ioutil.ReadFile(filename)
// 			if err != nil {
// 				temp := [][]float64{}
// 				lines[i] = append(lines[i], temp)
// 			} else {
// 				str := strings.Split(string(content), "\n")
// 				num, _ := strconv.ParseInt(str[0], 10, 64)

// 				temp := [][]float64{}

// 				for k := 1; k <= int(num); k++ {
// 					dataPoint := strings.Split(str[k], " ")
// 					value1, _ := strconv.ParseFloat(dataPoint[0], 64)
// 					value2, _ := strconv.ParseFloat(dataPoint[1], 64)
// 					dataPointSlice := []float64{value1, value2}
// 					temp = append(temp, dataPointSlice)
// 				}
// 				lines[i] = append(lines[i], temp)

// 				//calculate cov_data = [p.md_con_lung' p.md_ips_lung' p.md_esop' p.md_heart' p.d95_ptv' p.dmax_ptv' p.dmax_cord'];
// 				if i <= 3 {
// 					meanDose = calMeanDose(temp)
// 					middleData[j] = append(middleData[j], meanDose)
// 				} else if i == 4 {
// 					d95 = calD95(temp)
// 					dMax = calDmax(temp)
// 					middleData[j] = append(middleData[j], d95)
// 					middleData[j] = append(middleData[j], dMax)
// 				} else if i == 5 {
// 					dMax = calDmax(temp)
// 					middleData[j] = append(middleData[j], dMax)
// 				}
// 			}
// 		}
// 	}
// }

// //function for left lung
// func returnPRP(data [][]float64) float64 {
// 	con := -2.98
// 	cd := 0.0356
// 	cv := 4.13
// 	cv2 := -5.18
// 	cd2 := -0.000727
// 	cdv := 0.221
// 	PRPSum := float64(0)
// 	PRP := []float64{}

// 	var meanDose float64
// 	var totalVolume float64

// 	for i := 0; i < len(data); i++ {
// 		dose := data[i][0]
// 		volume := data[i][1]

// 		expFactor := con + cd*dose + cv*volume + cd2*math.Pow(dose, 2) + cv2*math.Pow(volume, 2) + cdv*dose*volume
// 		tempData := float64(1 / (1 + math.Log((-1.0)*expFactor)))
// 		PRP = append(PRP, tempData)
// 		if math.IsNaN(PRP[i]) == false {
// 			PRPSum += PRP[i]
// 			meanDose += dose * volume
// 			totalVolume += volume
// 		}
// 	}

// 	PRPValue := PRPSum / (1.15 * float64(len(data)))
// 	meanDose /= totalVolume

// 	return PRPValue * 100
// }

// //function for Esophagus
// func returnPRE(data [][]float64) float64 {
// 	con := -2.98
// 	cd := 0.0356
// 	cv := 4.13
// 	cv2 := -5.18
// 	cd2 := -0.000727
// 	cdv := 0.221
// 	PRPSum := float64(0)
// 	PRP := []float64{}

// 	for i := 0; i < len(data); i++ {
// 		dose := data[i][0]
// 		volume := data[i][1] + 1

// 		expFactor := con + cd*dose + cv*volume + cd2*math.Pow(dose, 2) + cv2*math.Pow(volume, 2) + cdv*dose*volume
// 		tempData := float64(1 / (1 + math.Log((-1.0)*expFactor)))
// 		PRP = append(PRP, tempData)
// 		if math.IsNaN(PRP[i]) == false {
// 			PRPSum += PRP[i]
// 			PRPSum += math.Pow(volume, 4)
// 		}
// 	}

// 	PRPValue := math.Pow(PRPSum, 1.0)/8/float64(len(data)) - 0.2

// 	return PRPValue * 100
// }

// func handler(w http.ResponseWriter, r *http.Request){
// 	templates.ExecuteTemplate(w, "index.html", nil);
// }

/********************************functions for future use*****************************/
