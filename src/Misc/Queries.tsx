export function fileQuery(spatialActor: string): string {
  return `
      prefix sg: <http://example.org/scenegraph#>
      prefix ex: <http://example.org/ex#>
      prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      prefix xsd: <http://www.w3.org/2001/XMLSchema#>
      prefix dcterms: <http://purl.org/dc/terms/>
      prefix dcat: <http://www.w3.org/ns/dcat#>
      prefix prov: <http://www.w3.org/ns/prov#>

      SELECT ?downloadURL ?mediatype ?filename
      WHERE {   
      <${spatialActor}> a sg:SpatialActor;
        dcterms:title ?filename;
        sg:hasRepresentation ?dist .

      ?dist a dcat:Distribution ;
        dcat:downloadURL ?downloadURL;
        dcterms:mediaType ?mediatype .
      }
    `;
}

export function selectSceneGraphActors(date: Date): string {
  return `        
    PREFIX sg: <http://example.org/scenegraph#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    PREFIX prov: <http://www.w3.org/ns/prov#>

    SELECT DISTINCT
        ?s 
    WHERE
      {
        ?s a sg:SpatialActor .

        ?transform a sg:Transformation ;
          sg:hasSpatialActor ?s ;
          prov:generatedAtTime ?created .
        
        FILTER (?created <= "${date.toISOString()}"^^xsd:dateTime)
      }
    `;
}

export function selectTransform(spatialActor: string, date: Date): string {
  return `
    PREFIX sg: <http://example.org/scenegraph#>
    PREFIX ex: <http://example.org/ex#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    PREFIX prov: <http://www.w3.org/ns/prov#>

    SELECT ?transform ?p ?o

      WHERE {
        <${spatialActor}> a sg:SpatialActor .
        <${spatialActor}> ?p ?o .
        OPTIONAL {
          ?transform rdf:type sg:Transformation ;
                    sg:hasSpatialActor <${spatialActor}> ;
                    ?prop ?obj ;
                    prov:generatedAtTime ?created .
          FILTER (?created <= "${date.toISOString()}"^^xsd:dateTime)
          FILTER NOT EXISTS {
            ?otherTransform rdf:type sg:Transformation ;
              sg:hasSpatialActor <${spatialActor}> ;
              prov:generatedAtTime ?otherCreated .
            FILTER (?otherCreated > ?created && ?otherCreated <= "${date.toISOString()}"^^xsd:date)
          }
          BIND(?transform AS ?latestTransform)
          BIND(?created AS ?latestCreated)
        }
      }
      ORDER BY DESC(?latestCreated)
      LIMIT 1

    `;
}

export function constructTransformMatrix(transformSubject: string): string {
  return `
      PREFIX sg: <http://example.org/scenegraph#>
      PREFIX ex: <http://example.org/ex#>
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

      CONSTRUCT {
          <${transformSubject}> ?p ?o
      } WHERE {
          <${transformSubject}> ?p ?o
      }

    `;
}
