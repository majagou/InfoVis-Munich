# Visualisation of Public Traffic Networks
Welcome to the Information Visualisation project by Team 28! Delve into our work on mapping public transport networks and their influence on urban landscapes.

## Content
- [About Us](#about-us)
- [Description](#description)
- [Features](#features)
- [Vision](#vision)
- [Sources](#sources)
- [Technologies Used](#technologies-used)
- [Project Status](#project-status)
- [Acknowledgements](#acknowledgements)

## About Us
We are Shiyi Gou and Yunuo Zhang, passionate about data visualization and urban studies.
| Member            | Current Position                           |
|-------------------|--------------------------------------------|
| Shiyi Gou         | LMU München, Medieninformatik MA           |
| Yunuo Zhang       | LMU München, Human-Computer-Interaction MA |

## Description
In the winter semester of 2023/24 at LMU, we developed an innovative information visualization website focusing on the intricate public transport networks of Munich. Our project examines how these networks correlate with the city's population distribution and public facilities. Utilizing a Bavarian Choropleth map, we offer unique insights into urban dynamics, including a detailed analysis of population changes from 2012 to 2022 through an interactive timeline.

## Features
- **User onboarding instruction:**
Guide user step by step to get familiar with our website functions
- **Population Density Map:**
Visualize Munich's population density and its relation to transport networks.
- **Timeline change:**
Track the evolution of population and density from 2012 to 2022.
- **Filters with checkboxes:**
Display options for WCs, Markets, and Stations.
- **Information Display Checkbox:**
Toggle to view detailed area and stop information.

## Vision
![Alt text](<figures/Vision Screenshots/Density.png>)
![Alt text](<figures/Vision Screenshots/Cluster.png>)

## Sources

*Geojson data for map visualisation*
- [City Districts of Munich](https://geoportal.muenchen.de/portal/opendata/?Map/layerIds=gsm_wfs:vablock_stadtbezirke_opendata&visibility=true&transparency=0&Map/center=[688947,5337402]&Map/zoomLevel=4) by [Open Geodata Portal des Geoportals](https://geoportal.muenchen.de/portal/opendata/)
- [Substricts of Munich](https://geoportal.muenchen.de/portal/opendata/?Map/layerIds=gsm_wfs:vablock_bezirksteil_opendata&visibility=true&transparency=0&Map/center=[688947,5337402]&Map/zoomLevel=4) by [Open Geodata Portal des Geoportals](https://geoportal.muenchen.de/portal/opendata/)
- [Quarters of Munich](https://geoportal.muenchen.de/portal/opendata/?Map/layerIds=gsm_wfs:vablock_viertel_opendata&visibility=true&transparency=0&Map/center=[688947,5337402]&Map/zoomLevel=4) by [Open Geodata Portal des Geoportals](https://geoportal.muenchen.de/portal/opendata/)
- [Public WC in Munich](https://geoportal.muenchen.de/portal/opendata/?Map/layerIds=gsm:wc_finder&visibility=true&transparency=0&Map/center=[688947,5337402]&Map/zoomLevel=4) by [Open Geodata Portal des Geoportals](https://geoportal.muenchen.de/portal/opendata/)
- [Markets in Munich](https://geoportal.muenchen.de/portal/opendata/?Map/layerIds=gsm_wfs:maerkte_opendata&visibility=true&transparency=0&Map/center=[688947,5337402]&Map/zoomLevel=4) by [Open Geodata Portal des Geoportals](https://geoportal.muenchen.de/portal/opendata/)

*CSV dataset for population Bavarian Choropleth map*
- [Population density of Munich from 2000 to 2022](https://opendata.muenchen.de/dataset/0be6dc92-9ca5-4ae9-8a08-ba4039f2a225/resource/3f4aea4c-a79a-4f5b-ab01-a6ad540449f0/download/indikat_bevoelkerung_bevoelkerungsdichte_240723.csv) by [Statistisches Amt München](https://www.mstatistik-muenchen.de/indikatorenatlas/export/export.php)
- [Stationslist MVV](https://www.mvv-muenchen.de/fileadmin/mediapool/02-Fahrplanauskunft/03-Downloads/openData/20-01-MVV_HST-_s20-o-T.csv) by [Münchner Verkehrs- und Tarifverbund GmbH (MVV](https://www.mvv-muenchen.de/fahrplanauskunft/fuer-entwickler/opendata/index.html)

*Animation Resource*
- [Staggering](https://animejs.com/documentation/#gridStaggering) 

## Technologies Used
Our project heavily relies on D3.js, a powerful JavaScript library for producing dynamic, interactive data visualizations in web browsers. We chose D3.js for its flexibility and capabilities in rendering complex data-driven visualizations, which was crucial for effectively presenting the public transport networks and population distribution of Munich. Other technologies used in this project include HTML, CSS, and JavaScript for the frontend development.

### Why D3.js?
- **Dynamic Visualizations**: D3.js allowed us to create interactive and dynamic maps, which are essential for visualizing time-series data and population densities effectively.
- **Data-Driven Approach**: With D3.js, we could directly bind complex data to the DOM and apply data-driven transformations to the document, enabling a more comprehensive and detailed visualization of public transport networks.
- **Customizability**: It offered us the flexibility to customize visualizations to fit our specific project requirements, enhancing the user's experience and understanding of the data.

For more information on D3.js, visit [D3.js official website](https://d3js.org/).

## Project Status
The project is currently active and regularly updated.

## Acknowledgements
We extend our heartfelt thanks to Professor Andreas Butz and all the Information Visualization (IV) tutor groups for their invaluable guidance throughout this project. Their expertise and support played a crucial role in navigating through challenges and enhancing our learning experience. We are deeply grateful for their dedication and the insights they provided, which significantly contributed to the success of our work.
