import { html } from "@polymer/polymer/lib/utils/html-tag.js";
import { PolymerElement } from "@polymer/polymer/polymer-element.js";
import { afterNextRender } from "@polymer/polymer/lib/utils/render-status.js";
import "@polymer/iron-ajax/iron-request.js";

/**
 * `data-gql`
 *
 * Requests execution of given operation, query and variables
 * to a GraphQL server and returns the results as an immutable
 * datastructure, along with their schema in-band.
 *
 * Namespaces:
 *
 *   Polymer.DataGQL.Entities – Entity models of the records
 *     returned by the fetch() method
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
class DataGQL extends PolymerElement {
  static get is() {
    return "data-gql";
  }
  static get properties() {
    return {
      /** When true, the element will log its flow of execution and data to;
          the console; intended for development, do not set in production. */
      logging: {
        type: Boolean,
        value: false,
        // One-way, downward
        notify: false,
        readOnly: false
      },
      /** When true, automatically performs a new request by calling the
          `fetch()` method, when either `url`, `query`, `variables`, `op`
          or `credential` changes. Otherwise, call the `fetch()` method,
          whenever you want to (re-)fetch data. */
      auto: {
        type: Boolean,
        value: false,
        // One-way, downward
        notify: false,
        readOnly: false
      },
      /** URL of the target GraphQL server. */
      url: {
        type: String, // URI
        value: void 0,
        // One-way, downward
        notify: false,
        readOnly: false
      },
      /** GraphQL query document, represented as a string, to submit to the server
          to fetch or mutate data. */
      query: {
        type: String,
        value: void 0,
        // One-way, downward
        notify: false,
        readOnly: false
      },
      /** Name of the operation that the GraphQL should execute; only meaningful
          if the query document defines more than one operation. */
      op: {
        type: String,
        value: void 0,
        // One-way, downward
        notify: false,
        readOnly: false
      },
      /** Map of values for the variables referenced in the query document, if any. */
      variables: {
        type: Object,
        value: void 0,
        // One-way, downward
        notify: false,
        readOnly: false
      },
      /** Credential token to send to GraphQL server to authenticate, when fetching data. */
      credential: {
        type: Object,
        value: void 0,
        // One-way, downward
        notify: false,
        readOnly: false
      },
      /** Response of the GraphQL server to the submitted query, as an immutable datastructure,
          containing data, errors (if any) and schema, as well as some meta information.

          Data structure will come in following shape:

              Map {
                data: Map {
                  queryOrMutationTypeName: { ‹QueryOrMutationResult› },
                  … more query or mutation results, if the query documents had such …
                },
                errors: List [
                  …
                ],
                schema: Map {
                  queryOrMutationTypeName: { ‹Schema› }
                },
                meta: Map {
                  fetchedFrom: "‹URL›",
                  fetchedAt: ‹Data›
                }
              }
      */
      data: {
        type: Object,
        value: void 0,
        observer: "_dataChanged",
        // One-way, upward
        notify: true,
        readOnly: true
      }
    };
  }

  static get observers() {
    return ["_queryChanged( url, query, variables, op, credential)"];
  }
  static get template() {
    return html`
      <iron-request></iron-request>
    `;
  }

  static get log() {
    return {
      error: console.error.bind(
        console,
        `%c${DataGQL.is}> %c%s`,
        "color:gray",
        "color:red"
      ),
      warn: console.warn.bind(
        console,
        `%c${DataGQL.is}> %c%s`,
        "color:gray",
        "color:darkorange"
      ),
      info: console.info.bind(
        console,
        `%c${DataGQL.is}> %c%s`,
        "color:gray",
        "color:black"
      ),
      debug: console.debug.bind(
        console,
        `%c${DataGQL.is}> %c%s %o`,
        "color:gray",
        "color:gray"
      )
    };
  }

  static _serializeQueryToURL(serverURL, queryStr, variablesObj, opName) {
    // NOTE: iron-request will escape the URI components for us
    return (
      `${serverURL}?query=${queryStr}&variables=${JSON.stringify(
        variablesObj
      )}` +
      (typeof opName === "undefined" || opName === null
        ? ""
        : `&operationName=${opName}`)
    );
  }

  static _makeSchemaForData(dataObj) {
    const firstKeyName = Object.keys(dataObj)[0];
    return Immutable.Map().set(
      firstKeyName,
      new Polymer.DataGQL.SchemaEntities.QueryResultRecordType({
        item: Immutable.Map({
          id: new Polymer.DataGQL.SchemaEntities.ScalarIDType(),
          description: new Polymer.DataGQL.SchemaEntities.ScalarStringType(),
          isPrivate: new Polymer.DataGQL.SchemaEntities.ScalarBooleanType(),
          license: new Polymer.DataGQL.SchemaEntities.ScalarStringType(),
          pushedAt: new Polymer.DataGQL.SchemaEntities.ScalarDateType()
        })
      })
    );
  }

  constructor() {
    super();
    if (typeof Polymer === "undefined") {
      window.Polymer = {};
    }
    if (typeof Polymer.DataGQL === "undefined" || Polymer.DataGQL === null) {
      Polymer.DataGQL = {
        Entities: {
          Meta: Immutable.Record(
            {
              fetchedFrom: void 0,
              fetchedAt: void 0
            },
            "Meta"
          ),
          Response: Immutable.Record(
            {
              data: void 0,
              errors: void 0,
              schema: void 0,
              meta: void 0
            },
            "Response"
          )
        },
        SchemaEntities: {
          QueryResultRecordType: Immutable.Record(
            {
              kind: "QUERYRESULT",
              type: "Record",
              item: void 0
            },
            "Record"
          ),
          QueryResultRecordsetType: Immutable.Record(
            {
              kind: "QUERYRESULT",
              type: "Recordset",
              items: void 0
            },
            "Recordset"
          ),
          ScalarIDType: Immutable.Record(
            {
              kind: "SCALAR",
              type: "String"
            },
            "ID"
          ),
          ScalarStringType: Immutable.Record(
            {
              kind: "SCALAR",
              type: "String"
            },
            "String"
          ),
          ScalarBooleanType: Immutable.Record(
            {
              kind: "SCALAR",
              type: "Boolean"
            },
            "Boolean"
          ),
          ScalarDateType: Immutable.Record(
            {
              kind: "SCALAR",
              type: "Date"
            },
            "Date"
          )
        }
      };
    }
  }

  _queryChanged(url, query, variables, op, credential) {
    if (this.auto) {
      afterNextRender(this, this.fetch);
    }
  }

  _dataChanged(newData, oldData) {
    if (this.logging)
      DataGQL.log.debug(
        (typeof oldData === "undefined" || oldData === null
          ? "Fetched"
          : "Re-fetched") +
          ` data from ${
            newData.meta.fetchedFrom
          } at ${newData.meta.fetchedAt.toISOString()}`,
        newData.toString()
      );
  }

  fetch() {
    let request = document.createElement("iron-request");
    if (this.logging)
      DataGQL.log.info(
        `Querying GQL server at ${this.url}${
          this.op ? " for op " + this.op : ""
        }…`
      );
    request
      .send({
        method: "GET",
        url: DataGQL._serializeQueryToURL(
          this.url,
          this.query,
          this.variables,
          this.op
        ),
        async: true,
        handleAs: "json"
      })
      .catch(err => {
        DataGQL.log.error("Error while querying server: " + err);
      })
      .then(xhrObj => {
        if (this.logging)
          DataGQL.log.debug(
            "Received response from server with status " + xhrObj.status,
            {
              status: xhrObj.status,
              statusText: xhrObj.statusText,
              errored: xhrObj.errored,
              timedOut: xhrObj.timedOut,
              aborted: xhrObj.aborted
            }
          );
        this._handleResponse(xhrObj.response);
      })
      .catch(err => {
        DataGQL.log.error("Error while transforming response: " + err);
      });
  }

  _handleResponse(response) {
    if (this.logging)
      DataGQL.log.debug(
        "Transforming XHR response into an immutable datastructure",
        response
      );

    const responseNorm =
      response != null
        ? {
            data: response.hasOwnProperty("data") ? response.data : void 0,
            errors: response.hasOwnProperty("errors") ? response.errors : void 0
          }
        : {
            data: void 0,
            errors: void 0
          };

    this._setData(
      new Polymer.DataGQL.Entities.Response({
        meta: new Polymer.DataGQL.Entities.Meta({
          fetchedFrom: this.url,
          fetchedAt: new Date()
        }),
        data: Immutable.fromJS(responseNorm.data),
        errors: Immutable.fromJS(responseNorm.errors),
        schema: DataGQL._makeSchemaForData(responseNorm.data)
      })
    );
    let event = new CustomEvent("on-data-changed", { detail: this.data });
    this.dispatchEvent(event);
  }
}

window.customElements.define(DataGQL.is, DataGQL);
