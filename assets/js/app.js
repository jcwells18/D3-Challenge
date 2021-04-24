//set svg dimensions
var svgWidth = 960;
var svgHeight = 620;

//set svg margin
var margin = {
    top: 20,
    right: 40,
    bottom: 200,
    left: 100
};

//set width and height with margins
var width = svgWidth - margin.right - margin.left;
var height = svgHeight - margin.top - margin.bottom;

//append div classed chart to the scatter element
var chart = d3.select("#scatter").append("div").classed("chart",true);

//append svg element to chart
var svg = chart.append("svg")
    .attr("width",svgWidth)
    .attr("height",svgHeight);

//append svg group
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

//set initial parameters
var chosenxAxis = "poverty";
var chosenyAxis = "healthcare";

//function to update x-scale w/ click on axis label
function xScale(censusData, chosenxAxis) {
    var xLinearscale = d3.scaleLinear()
    .domain([d3.min(censusData, d=> d[chosenxAxis]) * 0.8,
        d3.max(censusData, d=> d[chosenxAxis]) * 1.2
    ])
    .range([0, width]);

    return xLinearscale;
}

//function to update y-scale w/ click on axis label
function yScale(censusData, chosenyAxis){
    var yLinearscale = d3.scaleLinear()
    .domain([d3.min(censusData, d=> d[chosenyAxis]) * 0.8,
        d3.max(censusData, d=>d[chosenyAxis]) * 1.2
    ])
    .range([height, 0]);
    return yLinearscale;
}

//function to update x-axis w/ click on axis label
function modifyAxesX(newXscale, xAxis){
    var bottomAxis = d3.axisBottom( newXscale);

    xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

    return xAxis;
}
//function to update y-axis w/ click on axis label
function modifyAxesY(newYscale, yAxis){
    var leftAxis = d3.axisLeft(newYscale);

    yAxis.transition()
    .duration(1000)
    .call(leftAxis);

    return yAxis;
}

//function to update circles
function modifyCircles(circlesGroup, newXscale, chosenxAxis, newYscale, chosenyAxis){
    circlesGroup.transition()
    .duration(1000)
    .attr("cx",data=> newXscale(data[chosenxAxis]))
    .attr("cy",data=> newYscale(data[chosenyAxis]));
    
    return circlesGroup;
}
//function to update labels
function modifyText(textGroup, newXscale, chosenxAxis, newYscale, chosenyAxis){
    textGroup.transition()
    .duration(1000)
    .attr("x", d => newXscale(d[chosenxAxis]))
    .attr("y", d=> newYscale(d[chosenyAxis]));

    return textGroup;
}


//grab data from csv and execute
d3.csv("./assets/data/data.csv").then(function(censusData){
    console.log(censusData)

    //parse
    censusData.forEach(function(data){
        data.age = +data.age;
        data.healthcare = +data.healthcare;
        data.income = +data.income;
        data.obesity = +data.obesity;
        data.poverty = +data.poverty;
        data.smokes = +data.smokes;
    
    });

    //create linear scales
    var xLinearscale = xScale(censusData, chosenxAxis, width);
    var yLinearscale = yScale(censusData, chosenyAxis, height);

    //create intial axis 
    var bottomAxis = d3.axisBottom(xLinearscale);
    var leftAxis = d3.axisLeft(yLinearscale);

    //append x-axis
    var xAxis = chartGroup.append("g")
                .classed("x-axis", true)
                .attr("transform", `translate(0, ${height})`)
                .call(bottomAxis);

    //append y-axis
    var yAxis = chartGroup.append("g")
                .classed("y-axis", true)
                .call(leftAxis);

    //append circles
    var circlesGroup = chartGroup.selectAll("circle")
    .data(censusData)
    .enter()
    .append("circle")
    .classed("stateCircle", true)
    .attr("cx", d=> xLinearscale(d[chosenxAxis]))
    .attr("cy", d=> yLinearscale(d[chosenyAxis]))
    .attr("r", 15);

    //append text
    var textGroup = chartGroup.selectAll(".stateText")
    .data(censusData)
    .enter()
    .append("text")
    .classed("stateText", true)
    .attr("x", d=> xLinearscale(d[chosenxAxis]))
    .attr("y", d=> yLinearscale(d[chosenyAxis]))
    .attr("dy","3")
    .attr("font-size", "10px")
    .text(function(d) {return d.abbr});

    //create group for x labels
    var xLabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width/2}, ${height + 20 + margin.top})`);

    //append poverty label
    var povertyLabel = xLabelsGroup.append("text")
    .classed("aText", true)
    .classed("active", true)
    .attr("x",0)
    .attr("y",20)
    .attr("value","poverty")
    .text("Household Income");


    //append age label
    var ageLabel = xLabelsGroup.append("text")
    .classed("aText", true)
    .classed("inactive", true)
    .attr("x",0)
    .attr("y",40)
    .attr("value","age")
    .text("Age (Median)");
    

    //create group for y labels
    var yLabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${0 - margin.left/4}, ${(height/2)})`);

    var healthcareLabel = yLabelsGroup.append("text")
    .classed("aText", true)
    .classed("active", true)
    .attr("x",0)
    .attr("y",0-20)
    .attr("dy", "1em")
    .attr("transform","rotate(-90)")
    .attr("value","healthcare")
    .text("Healthcare");

    var smokingLabel = yLabelsGroup.append("text")
    .classed("aText", true)
    .classed("inactive", true)
    .attr("x",0)
    .attr("y",0-40)
    .attr("dy", "1em")
    .attr("transform","rotate(-90)")
    .attr("value","smokes")
    .text("Smokers (%)");
});

//x axis event listener
xLabelsGoup.selectAll("text")
    .on("click", function(){
    //get value for selection
    var value = d3.select(this).attr("value");

    //check for if value has the same axis
    if (value != chosenxAxis){
        chosenxAxis = value;

        //update x scale
        xLinearscale = xScale(censusData, chosenxAxis);

        //update x asis
        xAxis = modifyAxesX(xLinearscale, xAxis);

        //update circles
        circlesGroup = modifyCircles(circlesGroup, xLinearscale, chosenx);

        //update text
        textGroup = modifyText(textGroup, xLinearscale);
        


    }
//x axis event listener
yLabelsGroup.selectAll("text")
.on("click", function(){
    //get value for selection
    var value = d3.select(this).attr("value");

    //check for if value has the same axis
    if (value != chosenyAxis){
        chosenyAxis = value;

        //update x scale
        yLinearscale = yScale(censusData, chosenyAxis);

        //update x asis
        yAxis = modifyAxesX(yLinearscale, yAxis);

        //update circles
        circlesGroup = modifyCircles(circlesGroup, xLinearscale, chosenxAxis, yLinearscale, chosenyAxis);

        //update text
        textGroup = modifyText(textGroup, xLinearscale, chosenxAxis, yLinearscale, chosenyAxis);
        

    }
})
})
