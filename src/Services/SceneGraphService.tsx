import * as rdf from "rdflib";

export default class SceneGraphService {
  async contructSparqlQuery(): Promise<rdf.Store | null> {
    const graph = rdf.graph();
    const endpointUrl = "http://localhost:7200/repositories/scenegraphtests";

    const query = `
        
        PREFIX sg: <http://example.org/scenegraph#>
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        construct { 
            ?s ?p ?o
            }  
        where {
            ?s a sg:SpatialActor;
            ?p ?o.
        }

        `;

    await rdf
      .fetcher(graph, {})
      .load(endpointUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/sparql-query",
        },
        mode: "cors",
        body: query,
      })
      .then(() => {
        return graph;
        // graph.statements.forEach((statement) => {
        //   console.log(
        //     `${statement.subject.value} ${statement.predicate.value} ${statement.object.value}`
        //   );
        // });
      })
      .catch((err) => {
        console.error(err);
        return null;
      });

    return graph;
  }
}
