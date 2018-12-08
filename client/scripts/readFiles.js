// read in patient files
var readFiles = function(patient, number,pn)
{
	var lines = [];
	var path = "../patient_data/qcMCO/Patient_"+pn+"/"

	// read directory

	// sort by ROI name


	// initialize the whole array for each roi

	for(var i=0; i<number; i++)
	 {
	    lines[i] = [];
	 }


	// patient 0: dvh12960
	// patient 1: dvh12967
	// patient 2: Patient12550Dvh
	// patient 3: Patient12578_Dvh

	// determine which patient files to read in
	//var path = "";
	/*if(patient)
		path = "./patient_data/qcMCO/dvh12977/";
	else
		path = "./patient_data/qcMCO/Patient12550Dvh/";
		path = "./patient_data/qcMCO/dvh12977/";*/
	
	// readin files
	/*var planParts = ['CRT_3D.', 'CRT_con.', 'CRT_Esop.', 'CRT_Heart.', 'CRT_ips.', 
	   'IMRT_9B.', 'IMRT_con.', 'IMRT_Esop.', 'IMRT_Heart.', 'IMRT_ips.', 
	   'NCP_27B.', 'NCP_27B_con.', 'NCP_27B_Esop.', 'NCP_27B_Heart.', 'NCP_27B_ips.', 
	   'NCP_Arc.', 'NCP_Arc_con.', 'NCP_Arc_esop.', 'NCP_Arc_heart.', 'NCP_Arc_ips.'];*/
	//var planParts = ['CRT_3D.', 'CRT_con.', 'CRT_Esop.', 'CRT_Heart.', 'CRT_ips.'];
	var planParts = ['CRT_3D.', 'CRT_con.', 'CRT_Esop.', 'CRT_Heart.', 'CRT_ips.', 'IMRT_9B.',
	'IMRT_con.', 'IMRT_Esop.','IMRT_Heart.','NCP_27B_con.','NCP_27B_Esop.','NCP_27B_Heart.',
	'NCP_27B_ips.','NCP_27B.','NCP_Arc_con.','NCP_Arc_esop.','NCP_Arc_heart.','NCP_Arc_ips.'];
	var oarParts = ['Heart', 'Lt_Lung', 'Rt_Lung', 'Esophagus', 'PTV'];

	//var oarParts = ['heart', 'esophagus', 'PTV'];
    var ftype = ['.ddvh']
    for(var ioar=0; ioar < oarParts.length ; ioar++) {
    	for(var iplan=0; iplan < planParts.length ; iplan++) {
    		var filename = path + planParts[iplan] + oarParts[ioar] + ftype;
    		//console.log(filename);

    		lines[ioar].push(readTextFile(filename));
    	}
    }
    	console.log(lines[0].length);
    	return lines;

}


	/*
	lines[0].push(readTextFile(path + "IMRT_9B.Heart.ddvh"));
	lines[1].push(readTextFile(path + "IMRT_9B.Lt_Lung.ddvh"));
	lines[2].push(readTextFile(path + "IMRT_9B.Rt_Lung.ddvh"));
	lines[3].push(readTextFile(path + "IMRT_9B.Esophagus.ddvh"));
	lines[4].push(readTextFile(path + "IMRT_9B.PTV.ddvh"));

	lines[0].push(readTextFile(path + "IMRT_con.Heart.ddvh"));
	lines[1].push(readTextFile(path + "IMRT_con.Lt_Lung.ddvh"));
	lines[2].push(readTextFile(path + "IMRT_con.Rt_Lung.ddvh"));
	lines[3].push(readTextFile(path + "IMRT_con.Esophagus.ddvh"));
	lines[4].push(readTextFile(path + "IMRT_con.PTV.ddvh"));

	lines[0].push(readTextFile(path + "IMRT_Esop.Heart.ddvh"));
	lines[1].push(readTextFile(path + "IMRT_Esop.Lt_Lung.ddvh"));
	lines[2].push(readTextFile(path + "IMRT_Esop.Rt_Lung.ddvh"));
	lines[3].push(readTextFile(path + "IMRT_Esop.Esophagus.ddvh"));
	lines[4].push(readTextFile(path + "IMRT_Esop.PTV.ddvh"));

	lines[0].push(readTextFile(path + "IMRT_Heart.Heart.ddvh"));
	lines[1].push(readTextFile(path + "IMRT_Heart.Lt_Lung.ddvh"));
	lines[2].push(readTextFile(path + "IMRT_Heart.Rt_Lung.ddvh"));
	lines[3].push(readTextFile(path + "IMRT_Heart.Esophagus.ddvh"));
	lines[4].push(readTextFile(path + "IMRT_Heart.PTV.ddvh"));

	lines[0].push(readTextFile(path + "IMRT_ips.Heart.ddvh"));
	lines[1].push(readTextFile(path + "IMRT_ips.Lt_Lung.ddvh"));
	lines[2].push(readTextFile(path + "IMRT_ips.Rt_Lung.ddvh"));
	lines[3].push(readTextFile(path + "IMRT_ips.Esophagus.ddvh"));
	lines[4].push(readTextFile(path + "IMRT_ips.PTV.ddvh"));

	 // read in old patient files

	
	/*
	//var fs = ""; //require('fs');
	readdir(path, function(err, files) {
		if( err ){
			console.error("Fail: ", err);
		}
		files.forEach( function ( file, index ) {
			console.log(name)
			if (file.indexOf('.heart.') != -1) {
				lines[0].push(readTextFile(path+name));
			}
			if (file.indexOf('.lt_Lung.') != -1){
				lines[1].push(readTextFile(path+name));
			}
			if (file.indexOf('.rt_Lung.') != -1){
				lines[2].push(readTextFile(path+name));
			}
			if (file.indexOf('.esophagus.') != -1){
				lines[1].push(readTextFile(path+name));
			}
			if (file.indexOf('.PTV.') != -1){
				lines[1].push(readTextFile(path+name));
				}
			});
	});
	*/

	 /*
	 lines[0].push(readTextFile("./patient_data/LungDVHAD/heart/4-beam_Esop.heart.ddvh"));
     lines[1].push(readTextFile("./patient_data/LungDVHAD/left_lung/4-beam_Esop.L_lung.ddvh"));
	 lines[2].push(readTextFile("./patient_data/LungDVHAD/right_lung/4-beam_Esop.R_lung.ddvh"));
	 lines[3].push(readTextFile("./patient_data/LungDVHAD/esophagus/4-beam_Esop.esophagus.ddvh"));
	 lines[4].push(readTextFile("./patient_data/LungDVHAD/PTV/4-beam_Esop.PTV.ddvh"));

	 lines[0].push(readTextFile("./patient_data/LungDVHAD/heart/9-beam_Esop.heart.ddvh"));
	 lines[1].push(readTextFile("./patient_data/LungDVHAD/left_lung/9-beam_Esop.L_lung.ddvh"));
	 lines[2].push(readTextFile("./patient_data/LungDVHAD/right_lung/9-beam_Esop.R_lung.ddvh"));
	 lines[3].push(readTextFile("./patient_data/LungDVHAD/esophagus/9-beam_Esop.esophagus.ddvh"));
	 lines[4].push(readTextFile("./patient_data/LungDVHAD/PTV/9-beam_Esop.PTV.ddvh"));

	 lines[0].push(readTextFile("./patient_data/LungDVHAD/heart/38-beamNCP_Esop.heart.ddvh"));
	 lines[1].push(readTextFile("./patient_data/LungDVHAD/left_lung/38-beamNCP_Esop.L_lung.ddvh"));
	 lines[2].push(readTextFile("./patient_data/LungDVHAD/right_lung/38-beamNCP_Esop.R_lung.ddvh"));
	 lines[3].push(readTextFile("./patient_data/LungDVHAD/esophagus/38-beamNCP_Esop.esophagus.ddvh"));
	 lines[4].push(readTextFile("./patient_data/LungDVHAD/PTV/38-beamNCP_Esop.PTV.ddvh"));
	 */
