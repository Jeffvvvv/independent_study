// variables for the plot
var plot1; // interactive plot
var plot2; // ntcp plot
var plot3; // treatment range plot
var plot4;
var xClick; // x coordinates of a click
var yClick; // y coordinates of a click

//global variables
// var lines; // all the original data for all plans for the specific patient
var current = 0; // determine which organ is being adjusted
var patient = 0; // determines which patient data to read in

var choice = 0; // choice of organ from the navigation bar
//var organs = ['Heart', 'Left Lung', 'Right Lung', 'Esophagus', 'PTV'];
//var organs = ['Heart', 'Total Lung', 'Spinal Cord', 'Esophagus', 'PTV'];
var organs = ['Heart', 'Left Lung', 'Right Lung', 'Esophagus', 'PTV'];
var colors = ["#ff0000", "#ff6600", "#3399ff", "#009933", "#9900cc"]; // colors for all the organs

var rangeLines = []; // all plans for all organs
var maxLine = []; // the max at each dose of each organ
var minLine = []; // the min at each dose of each organ
// -------------------------------------------------------------------------------------------------------------
// Read in patient files


// read in the DDVH file
// function readTextFile(file)
// {
//   var rawFile = new XMLHttpRequest();
//   rawFile.open("GET", file, false);
//   rawFile.onreadystatechange = function ()
//   {
//       if(rawFile.readyState === 4)
//       {
//           if(rawFile.status === 200 || rawFile.status == 0)
//           {
//               // if everything is good then obtain the string and initialize the array for plotting
//               var dataString = rawFile.responseText;
//               //var dataString = Math.ceil(dataString);
//               return initialize(dataString);
//           }
//       }
//       return [];
//   }
//   rawFile.send(null);

//   // return what is returned when the file reading is complete
//   return rawFile.onreadystatechange.call();
// }

// // read the data from the text file string to obtain an array to pass to jqplot
// function initialize(dataString)
// {
//   var lines = dataString.split("\n");
//   var num = parseInt(lines[0], 10); // obtain the number of data points

//   s1 = [];

//   // build the array for jqplot
//   for(var i=1; i < num + 1; i++)
//   {
//     var pos = lines[i].split(" ");
//     s1.push([parseFloat(pos[0]), parseFloat(pos[1])]);
//   }

//   // return the dose array and the volume array
//   return s1;
// }

// ------------------------------------------------------------------------------------------------------------
// Create the plot using jqplot

// after reading all files generate the plot given the data points and options to move only in the y direction
// only plots for Chart 1
function plot(all, seriesOptions)
{
    // generate the interactive
    plot1 = $.jqplot('chart1', all,{
    title: 'Volume vs Dose',
    seriesColors: colors,
     axes: {
        xaxis:{
          label:'Dose (cGy)',
          labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
          min: 0,
          tickOptions: {
              mark: 'inside'
          },
          max: 8400,
          decimal: 0
        },
        yaxis:{
          label:'Relative Volume',
          labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
          pad: 1.0,
          tickOptions: {
              mark: 'inside'
          }
        }
     },
    highlighter: {
         sizeAdjust: 10,
         tooltipLocation: 'n',
         tooltipAxes: 'y',
         tooltipFormatString: '<b><i><span style="color:red;">cDVH</span></i></b> %.2f',
         useAxesFormatters: false
     },
     cursor: {
         show: true
     },
    legend: {
        show: true,
        renderer: $.jqplot.EnhancedLegendRenderer,
        location: 'w' ,
        placement : "outside",
        marginRight: '100px',
        rendererOptions: {
            numberColumns: 1
        },
        seriesToggle: true
      },
    series: seriesOptions
  });
}
//read information

//-----------------------------------------------------------------------------------------------------------------
// Plot graph

function readGraphs(lines){

  // for(var i=0; i<organs.length; i++)
  // {
  //   lines[i] = [];
  // }

  // lines = readFiles(patient,organs.length,path);

  // determine the max and min lines for each organx

  // initialize rangeLines
  for(var i=0; i<organs.length; i++)
  {
    rangeLines[i] = [];
  }


  console.log(lines)
  // each entry in rangeLines has all the converted data for that organ
  for(var i=0; i<lines[0].length; i++)
  {
    for(var j=0; j<rangeLines.length; j++)
    {
      rangeLines[j].push(convert(lines[j][i]));
    }
  }

  // initialize maxLine and minLine to initial low and high values
  // previously was error with max and min changing simultaneously
  for(var i=0; i<organs.length; i++)
  {
    maxLine[i] = [];
    minLine[i] = [];
    for(var k=0; k<lines[0][0].length; k++)
    {
      maxLine[i].push([rangeLines[i][0][k][0], -1]);
      minLine[i].push([rangeLines[i][0][k][0], 2]);
    }
  }

  // loop through all data files and determine max and min values out of all data files for each organ
  for(var i=0; i<lines.length; i++)
  {
    for(var j=0; j<lines[0].length; j++)
    {
      for(var k=0; k<lines[0][0].length; k++)
      {
        if(parseFloat(rangeLines[i][j][k][1]) > parseFloat(maxLine[i][k][1]))
        {
          maxLine[i][k][0] = rangeLines[i][j][k][0];
          maxLine[i][k][1] = rangeLines[i][j][k][1];
        }
        if(parseFloat(rangeLines[i][j][k][1]) < parseFloat(minLine[i][k][1]))
        {
          minLine[i][k][0] = rangeLines[i][j][k][0];
          minLine[i][k][1] = rangeLines[i][j][k][1];
        }
      }
    }
  }

}

// choose a plan to load to display on the graph
function loadGraph (index, patient, lines){
  /*$(document).ready(function(){
    $('#test').load('../patient_data/qcMCO/Patient_'+patient+'/info.txt');
    //change to not hardcode version
});*/
  // convert to cumulative
  // will be passed to plot data
  var converted = [];
  for(var i=0; i<lines.length; i++)
  {
    converted.push(convert(lines[i][index]));
  }

  // generate an array to pass in series options for all data sets
  var series = [];
  for(var i=0; i<converted.length; i++)
  {
    series.push({
      dragable: {
          color: '#ff3366',
          constrainTo: 'y'
      },
      markerOptions: {
        show: false,
        size: 2
     },
     label: organs[i]
    });
  }

  /////////////
  //BAR CHART//
  /////////////
  var bars = [];

  // does not include the PTV NTCP
  for(var i=0; i<converted.length - 1; i++)
  {
    if(organs[i] === 'Left Lung') // 'Heart', 'Left Lung', 'Right Lung', 'Esophagus', 'PTV'
      bars.push([organs[i], returnPRP(converted[i])]);
    if(organs[i] === 'Right Lung') // 'Heart', 'Left Lung', 'Right Lung', 'Esophagus', 'PTV'
      bars.push([organs[i], returnPRS(converted[i])]);
    if(organs[i] === 'Esophagus') // 'Heart', 'Left Lung', 'Right Lung', 'Esophagus', 'PTV'
      bars.push([organs[i], returnPRE(converted[i])]);
    if(organs[i] === 'Heart') // 'Heart', 'Left Lung', 'Right Lung', 'Esophagus', 'PTV'
      bars.push([organs[i], returnPRH(converted[i])]);
  }

  plot2 = $.jqplot('chart2', [bars], {
      seriesColors: colors,
      seriesDefaults: {
          renderer:$.jqplot.BarRenderer,
          pointLabels: { show: true },
          rendererOptions: {
                varyBarColor: true
            }
      },
      axes: {
          xaxis: {
              renderer: $.jqplot.CategoryAxisRenderer,
              decimal:0,
          },
          yaxis:{
            label:'NTCP (%)',
            labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
          }
      }
  });

  /////////////////////////
  //TREATMENT RANGE CHART//
  /////////////////////////
  var range = [maxLine[choice], minLine[choice], converted[choice]];

  // add another one to the series for the new line
  series.push({
      dragable: {
          color: '#ff3366',
          constrainTo: 'y'
      },
      markerOptions: {
        show: false,
        size: 2
     },
     label: 'Not seen'
    });

  // generate the jqplot
  // fills the area in between the max and min
  // also draws the currently selected line on top
  plot3 = $.jqplot('chart3', range, {
    title: 'Treatment Range of '+organs[choice],
    seriesColors: [colors[choice], colors[choice], '#000000'],
    axesDefaults: {
      pad: 1.05
    },
    fillBetween: {
      series1: 0,
      series2: 1,
      color: colors[choice],
      baseSeries: 0,
      fill: true
    },
    axes: {
        xaxis:{
          label:'Dose (cGy)',
          labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
          min: 0,
          tickOptions: {
              mark: 'inside'
          },
          max: 8400
        },
        yaxis:{
          label:'Relative Volume',
          labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
          pad: 1.0,
          tickOptions: {
              mark: 'inside'
          }
        }
     },
    seriesDefaults: {
      rendererOptions: {
        smooth: true
      }
    },
    series: series
  });
  /////////////////////////
  //TRADEOFF RANGE CHART//
  /////////////////////////
  var tradeoff_range = [maxLine[choice], minLine[choice]];

  // add another one to the series for the new line
  series.push({
      dragable: {
          color: '#ff3366',
          constrainTo: 'y'
      },
      markerOptions: {
        show: false,
        size: 2
     },
     label: 'Not seen'
    });

  // generate the jqplot
  // also draws the currently selected line on top
  plot4 = $.jqplot('chart3_2', tradeoff_range, {
    title: 'Tradeoff Range of '+organs[choice],
    seriesColors: ['#000000', '#000000'],
    axesDefaults: {
      pad: 1.05
    },
    fillBetween: {
      series1: 0,
      series2: 1,
      color: colors[choice],
      baseSeries: 0,
      fill: false
    },
    axes: {
        xaxis:{
          label:'Dose (cGy)',
          labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
          min: 0,
          tickOptions: {
              mark: 'inside'
          },
          max: 8400
        },
        yaxis:{
          label:'Relative Volume',
          labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
          pad: 1.0,
          tickOptions: {
              mark: 'inside'
          }
        }
     },
    seriesDefaults: {
      rendererOptions: {
        smooth: true
      }
    },
    series: series
  });



  // switch the Plugins on and off based on the chart being plotted
  $.jqplot.config.enablePlugins = true;
  // plot the data for the line chart
  plot(converted, series);
  // replot the data so graphs don't stack
  plot1.replot();
  $.jqplot.config.enablePlugins = false;
  plot2.replot();
  plot3.replot();
  plot4.replot();
}

//--------------------------------------------------------------------------------------------------------
// Utility Methods

//**********
// convert the data from dvh volume to cdvh volume
// uses method from Dr. Watkin's python program
function convert(data)
{
  var dose = [];
  var volume = [];
  var total_volume = 0;
  for(var i=0; i<data.length; i++)
  {
    dose.push(data[i][0]);
    volume.push(data[i][1]);
    total_volume += data[i][1];
  }

  totalData = [];
  for(var i=data.length-1; i>-1; i--)
  {
    var sum = volume.slice(0,i).reduce(function(a, b) { return a + b; }, 0);
    totalData[i] = [dose[i], 1 - sum/total_volume];
  }

  return totalData;
}

// return the probability in percent
function returnPRP(data)
{
  var con = -2.98;
  var c_d = 0.0356;
  var c_v = 4.13;
  var c_v2 = -5.18;
  var c_d2 = -0.000727;
  var c_dv = 0.221;
  var PRPSum = 0;
  var PRP = [];
 
  var mean_dose = 0;
  var total_volume = 0;

  for(var i=data.length-1; i>-1; i--)
  {
      var dose = data[i][0] ;
      var volume = data[i][1] ;
      var expFactor = con + c_d * dose + c_v * volume + c_d2 * Math.pow(dose, 2) + c_v2 * Math.pow(volume, 2) + c_dv * dose*volume;
      PRP[i] = 1 / (1 + Math.log(-1.0*expFactor));
      if(!isNaN(PRP[i]))
        PRPSum += PRP[i];
        mean_dose += dose*volume;
        total_volume += volume;
  }

  var PRP_Value = PRPSum / (1.15 * data.length);
  mean_dose = mean_dose / total_volume;
  //console.log(mean_dose)
  //PRP_Value = mean_dose;
  return PRP_Value * 100;
}

// return the probability in percent
function returnPRE(data)
{
  var con = -2.98;
  var c_d = 0.0356;
  var c_v = 4.13;
  var c_v2 = -5.18;
  var c_d2 = -0.000727;
  var c_dv = 0.221;
  var PRPSum = 0;
  var PRP = [];
  for(var i=data.length-1; i>-1; i--)
  {
      var dose = data[i][0];
      var volume = data[i][1]+1;
      var expFactor = con + c_d * dose + c_v * volume + c_d2 * Math.pow(dose, 2) + c_v2 * Math.pow(volume, 2) + c_dv * dose*volume;
      PRP[i] = 1 / (1 + Math.log(-1.0*expFactor));
      if(!isNaN(PRP[i]))
        PRPSum += PRP[i];
        PRPSum +=  Math.pow(volume,4) ;
  }

  var PRP_Value = Math.pow(PRPSum,1.0) / 8 / (data.length) - 0.2;

  return PRP_Value * 100;
}


function returnPRH(data)
{
  // Darby model, 7.5% increase per Gy
  var baseline_rate = 0.03;
  var mean_dose = 0;
  var total_volume = 0;
  for(var i=data.length-1; i>-1; i--)
  {
      var dose = data[i][0];
      var volume = data[i][1];
      var test_val = dose*volume;
      if(!isNaN(test_val))
        total_volume += volume;
        mean_dose += dose*volume;
  }
  mean_dose = mean_dose / total_volume / 100; // dose in Gy
  //console.log(mean_dose)
  var PRH_Value = baseline_rate + mean_dose * baseline_rate * 0.08 ;
  //PRP_Value = mean_dose;
  return PRH_Value * 100;
}

function returnPRS(data)
{
  // quantec model
  var max_dose = 0;
  var min_volume = 0.001;
  var flag_for_max = 0;
  var i = 0;
  while(max_dose == 0)
  {
      var dose = data[i][0];
      var volume = data[i][1];
      if(volume <= min_volume){
        max_dose = dose/100;
        console.log(volume)
        console.log(max_dose)
      }
      i = i+1;
  }

  // modeled as linear between 45-60 Gy
  if(max_dose <= 45)
    var PRS_Value = 0
  else {
    var PRS_Value = 0.1 / 15 * max_dose - 0.29;
  }
  return PRS_Value * 100;
}


// ---------------------------------------------------------------------------------------------------------------
// Starting function
function displayInfo(pn){
  $(document).ready(function () {
    //$('#test').load('/scripts/patient_info.txt');
    $.get('../patient_data/qcMCO/Patient_'+pn+'/info.txt',function(testing) {
      var patientcat = testing.split('Description')[0].split(';')[0];
      var patientname = testing.split('Description')[1].split(';')[0];
      var mrncat = testing.split('Description')[0].split(';')[1];
      var mrn = testing.split('Description')[1].split(';')[1];
      var bdcat = testing.split('Description')[0].split(';')[2];
      var bd = testing.split('Description')[1].split(';')[2];
      var dob = bd.split(' ')[1];
      var d = new Date();
      var age = d.getFullYear() - parseInt(dob.split('-')[0]);
      if(parseInt(dob.split('-')[1]) >= d.getMonth()+1){
        if(parseInt(dob.split('-')[1]) != d.getMonth()+1){
          age = age-1;
        }
        else{
          if(parseInt(dob.split('-')[2]) > d.getDate()){
            age = age-1;
          }
        }
      }
      var descat = (testing.split('total days;')[1].split('\n')[0]).slice(0,12);
      var des = testing.split('Description')[1].split(';')[13];
      $('#test').append('<p style="color:#75acff; font-size: 15px; border: 1px solid #ddd; padding: 5px 8px 5px 8px;">'+patientcat+': '+patientname+'<br><br>'+
      mrncat+':'+mrn+'<br><br>'+ bdcat+': ' + dob + '<br><br>'+ 'Age: ' + age + '<br><br>' + descat+': ' + des + '<br>'+ '<p>');
    });
  });
}





//Jeff's main commitment is here
//Re-write document.ready function
//All logic is located here including ajax communication between front-end and back-end
//Contain two ajax function - one is for generating patient lists
//Aother one is for generating ddvh lines and dynamic organ lists

$(document).ready(function () {

var buttonClick = true;
var infodisplayed = 0;

  //patient_button click logic : generate dynamic patient lists
  $("#patient_button").click(function changePatient(){
      if(buttonClick){
        buttonClick = false;
        //begin to generate dynamic patient lists
        $.ajax({
            url: "http://127.0.0.1:8080/patient_list",
            type: "GET",
            dataType: "jsonp",
            success: function(data){
                    console.log(data);
                    console.log(buttonClick);
                    var dropdown = document.getElementById("myDropdown");

                    //loop for generating buttons for each patient
                    for(var index_1 = 0; index_1 < data.length; index_1++){
                        var button1 = document.createElement("button1");
                        var a_1 = document.createElement("a");
                        var text = document.createTextNode(data[index_1]);
                        a_1.id = "username2";
                        a_1.className = "username";
                        a_1.href = "#pa";
                        a_1.appendChild(text);
                        button1.value = index_1;
                        button1.appendChild(a_1);

                        //---------------------Patient Button Onclick Function Begins----------------------------------
                        button1.onclick = function()
                        {
                          //button1 click logical
                          //1. get ddvh data from backend 
                          //2. get dynamic organ lists from backend

                          //get selected patient information
                          var patient = $(this).attr("value");
                          var patient_number = "Patient_" + patient;

                          //this ajax extract two data: 1 - dynamic organ list 2 - ddvh data to lines for this patient
                          $.ajax({
                            url: "http://127.0.0.1:8080/data",
                            type: "POST",
                            dataType: "jsonp",
                            data:{'value':patient_number},
                            success: function(data){
                              console.log(data)
                              //parse data into lines and organ lists
                              var lines = data.DDVHarray;
                              var organs = data.OrganList;
                              console.log(organs);

                              //1 - generate dynmaic button with corresponding onclick functions for each organ
                              var plan_organ_list = document.getElementById("plan_organ_list");
                              plan_organ_list.innerHTML = "";
                              var br = document.createElement("br");
                              plan_organ_list.appendChild(br);

                              //loop for generating buttons for each organs
                              for(var index_2 = 0; index_2 < organs.length; index_2++){
                                //create li
                                var li = document.createElement("li");
                                li.className = "init-un-active";
                                li.id = index_2 + 1;
                                //create a tag
                                var a_2 = document.createElement("a");
                                a_2.href = "javascript:void(0)";

                                //connect a tag with corresponding onclick functions
                                a_2.onclick = function(){
                                  var gw_nav = $('.gw-nav');
                                    gw_nav.find('li').removeClass('active');

                                    var checkElement = $(this).parent();
                                    var id = checkElement.attr('id');
                                    if(id == 1){ // Heart option was chosen
                                      choice = 0;
                                      loadGraph(0, patient, lines);
                                      console.log("HEART");
                                    }
                                    else if (id == 2){ // Left Lung option was chosen
                                      choice = 1;
                                      loadGraph(0, patient, lines);
                                      console.log("Total Lung");
                                    }
                                    else if (id == 3){ // Right Lung option was chosen
                                      choice = 2;
                                      loadGraph(0, patient, lines);
                                      console.log("Spinal Cord");
                                    }
                                    else if (id == 4){ // Esophagus option was chosen
                                      choice = 3;
                                      loadGraph(0, patient, lines);
                                      console.log("ESOPHAGUS");
                                    }
                                    else if (id == 5){ // PTV option was chosen
                                      choice = 4;
                                      loadGraph(0, patient, lines);
                                      console.log("PTV");
                                    }
                          
                                    var ulDom = checkElement.find('.gw-submenu')[0];

                                    if (ulDom == undefined) {
                                        checkElement.addClass('active');
                                        return;
                                    }
                                };
                                //create span
                                var span = document.createElement("span");
                                span.className = "gw-menu-text";
                                var text = document.createTextNode(organs[index_2]);
                                span.appendChild(text);
                                a_2.appendChild(span);
                                li.appendChild(a_2);
                                plan_organ_list.appendChild(li);
                              }

                              //get ddvh data for selected patient
                              //show the graph using lines
                              if(infodisplayed == 0){ //stops from displaying patient info multiple times
                                var infodisplayed = 1;
                                displayInfo(patient);
                              }

                              var treatment = $("#treatment").val();
                              //var patient = $("#username").val();
                              //var patient = 0; //hardcoded dso it oesn't required 0 in the textbox
                              //var patient = 2;
                              //patient = $(this).attr("value");
                              //var sample = document.getElementById("username2").innerText;
                              //alert(sample)
                              /*alert(patient);*/
                              /*$('#test').load('../patient_data/qcMCO/Patient_'+patient+'/info.txt');*/

                              readGraphs(lines);

                              loadGraph(0,patient,lines);



                              //displayInfo();
                              //begin to implement drag effect
                              //--------------------------Drag Begins-------------------------------------------------------------------------------------
                              // Highlight and Click Methods

                              // beginning of the drag
                              $('#chart1').bind('jqplotDragStart',
                              function (seriesIndex, pointIndex, pixelposition, data) {
                                  current = pointIndex; // determine which organ is being adjusted
                                  xClick = data.x;
                                  yClick = data.y;
                                  $("#curr").remove();
                              });

                              // adjust the graph according to the end of the drag
                              $('#chart1').bind('jqplotDragStop',
                              function (seriesIndex, pointIndex, pixelposition, data) {
                                // convert to cumulative
                                var converted = [];
                                for(var i=0; i<lines[current].length; i++)
                                {
                                  converted[i] = convert(lines[current][i]);
                                }

                                var xDist = []; // the x distance between each plan for the organ and the clicked point
                                for(var i=0; i<lines[current].length; i++)
                                  xDist.push(10000); //initialize the array
                                var xPt = []; // which index the closest x point is
                                for(var i=0; i<lines[current].length; i++)
                                  xPt.push(-1); //initialize the array

                                // gets closest x pt to dragged x pt for each graph
                                for(var i=0; i<converted.length; i++)
                                {
                                  var dist;
                                  for(var j=0; j<converted[i].length; j++)
                                  {
                                    dist = Math.abs(converted[i][j][0] - pixelposition.xaxis);
                                    if(dist < xDist[i])
                                    {
                                      xDist[i] = dist;
                                      xPt[i] = j;
                                    }
                                  }
                                }
                                var minDist = []; // the minimum y distance from each plan
                                for(var i=0; i<lines[current].length; i++)
                                  minDist.push(10000); //initialize the array

                                // gets the y dist for each at that x pt
                                for(var i=0; i<xPt.length; i++)
                                {
                                  minDist[i] = Math.abs(converted[i][xPt[i]][1] - pixelposition.yaxis);
                                }

                                var index = minDist.indexOf(Math.min.apply(Math, minDist)); // chooses the plan with the minimum y distance
                                //alert(xPt.length);
                                $(document).ready(function(){
                                  //use this part to display corresponding image
                                  //add one more button to reset
                                  /*
                                  if (index == 0){
                                    $("p").append("CRT_3D;");
                                  }
                                  if (index == 1){$("p").append("CRT_con;");
                                }
                                  if (index == 2){$("p").append("CRT_Esop.;");}
                                  if (index == 3){$("p").append("CRT_Heart.;");}
                                  if (index == 4){$("p").append("CRT_ips.;");}*/
                                  //$("#chart4").append("<img id=\"curr\" src=\"../patient_data/qcMCO/Patient_"+patient+"/"+index+".png\" width=550px>");
                                  //add current + treatment plan
                                    
                                    $("#chart4").append("<img id=\"curr\" src=\""+index+".png\" width=550px>");
                                  //add button reaction reset
                                  $("#delete").click(function(){
                                    $("#curr").remove();
                                  });
                                });
                                loadGraph(index, patient, lines);//add another load function to load images the logic can be first remove an image element and then add new image element
                              });

                            },
                            error: function(err){
                              alert(err)
                            }
                          });
                          //-------------------------Drag Ends-----------------------------------------------------------------------------------

                        //---------------------Patient Button Onclick Function Begins----------------------------------

                        };
                        dropdown.appendChild(button1);
                    }
                    dropdown.classList.toggle("show");      
            },
            error: function(error) {
                alert(error)
            }
        });
    }else{
      document.getElementById("myDropdown").classList.toggle("show");
    }
    });

}); // the click methods and navigation bar are wrapped in the document.ready function
