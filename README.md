# Introduction

This repository hosts a prototype for the EG-ICE 2023 paper "Towards Scene Graph Descriptions for Spatial Representations in the Built Environment". It is built on a React web viewer using THREE.js and IFC.js and an Oxigraph Graph Service, storing the Graph in the local repository.

# Getting Started

1. Run **"npm install"** in the console or terminal 
2. Make sure that Port 3000 and 3001 are free
3. Run "npm run dev" (Don't use npm start, since this will not start all services!)

# Initial Scene Graph

The initial graph is located under [/storage/graphOriginal.ttl](/storage/graphOriginal.ttl)

# SPARQL Queries

The queries used in this prototype are hosted under [/src/Misc/Queries.tsx](/src/Misc/Queries.tsx)

# Acknowledgement

This research is part of the DFG SPP 2388 ”Hundert plus” project Raumlink and the Strategic Basic
Research grant (grant no. 1S99020N) of the Research Foundation Flanders (FWO).