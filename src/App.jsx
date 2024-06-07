import { useEffect, useRef, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import * as d3 from "d3";

function App() {
  const data = useRef(null);
  const margin = 50;
  const width = 900;
  const height = 500;
  const getData = async () => {
    const resp = await fetch(
      "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json"
    );
    const da = await resp.json();
    data.current = da;
  };

  useEffect(() => {
    getData().then(() => {
      const curr = data.current.map((d) => {
        const clone = { ...d, Time: new Date(`1970-1-1 00:${d.Time}`) };
        return clone;
      });
      const svg = d3
        .select("#svgContainer")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

      const xScale = d3
        .scaleLinear()
        .range([margin, width - margin])
        .domain([
          d3.min(curr, (d) => d.Year) - 1,
          d3.max(curr, (d) => d.Year) + 1,
        ]);

      const yScale = d3
        .scaleTime()
        .domain(d3.extent(curr, (d) => d.Time))
        .range([margin, height - margin]);
      svg
        .append("g")
        .attr("transform", `translate(0,${height - margin})`)
        .attr("id", "x-axis")
        .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));
      svg
        .append("g")
        .attr("transform", `translate(${margin},0)`)
        .attr("id", "y-axis")
        .call(d3.axisLeft(yScale).tickFormat((d) => d3.timeFormat("%M:%S")(d)));

      svg
        .selectAll("circle")
        .data(curr)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("r", 5)
        .attr("cx", (d) => xScale(d.Year))
        .attr("cy", (d) => yScale(d.Time))
        .style("fill", (d) => (d.Doping ? "blue" : "red"))
        .style("stroke", "black")
        .style("opacity", 0.7)
        .attr("data-xvalue", (d) => Number(d.Year))
        .attr("data-yvalue", (d) => d.Time.toISOString());

      const legend = svg
        .append("g")
        .attr("id", "legend")
        .attr(
          "transform",
          `translate(${width - margin} ,${(height - margin) / 2})`
        )
        .style("width", "fit-content")
        .style("height", "fit-content");
      legend
        .append("text")
        .text("No Doping Aligations")
        .attr("transform", "translate(-105, 8)")
        .style("font-size", "10px");
      legend
        .append("rect")
        .attr("width", "10px")
        .attr("height", "10px")
        .style("fill", "red");
      legend
        .append("text")
        .text("Doping Aligations")
        .attr("transform", "translate(-105, 23)")
        .style("font-size", "10px");
      legend
        .append("rect")
        .attr("width", "10px")
        .attr("height", "10px")
        .attr("transform", "translate(0, 15)")
        .style("fill", "blue");

      const tooltip = d3
        .select("#main")
        .append("div")
        .attr("id", "tooltip")
        .style("width", "fit-content")
        .style("position", "absolute")
        .style("visibility", "hidden");

      const name = tooltip.append("p");
      const yearTime = tooltip.append("p");
      const reason = tooltip.append("p");

      d3.selectAll(".dot").on("mouseover", (e) => {
        const use = e.target.__data__;
        console.log(use);
        tooltip.style("visibility", "visible");
        tooltip.attr("data-year", e.target.getAttribute("data-xvalue"));
        tooltip.style("top", `${e.layerY - 20}px`);
        tooltip.style("left", `${e.layerX}px`);
        name.text(`${use.Name}: ${use.Nationality}`);
        yearTime.text(
          `Year: ${
            use.Year
          }, Time: ${use.Time.getMinutes()}:${use.Time.getSeconds()}`
        );
        if (use.Doping) {
          reason.style("padding-top", "10px");
          reason.text(use.Doping);
        }
      });
      d3.selectAll("circle").on("mouseout", (e) => {
        tooltip.style("visibility", "hidden");
      });
    }, []);
  });

  return (
    <div>
      <div id="main" className="mx-auto shadow">
        <div id="title">
          <h3>Doping in Professional Bicycle Racing</h3>
          <h5>35 Fastest times up Alpe d'Huez</h5>
        </div>
        <div id="svgContainer" style={{ width: 900, height: 500 }}></div>
      </div>
    </div>
  );
}

export default App;
