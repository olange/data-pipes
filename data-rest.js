import "@polymer/iron-ajax";

/**
 * `data-rest`
 *
 * A fabulous troubador that conveys the intricate meaning of your data, along the data itself, of course
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
class DataRest extends customElements.get("iron-ajax") {
  static get is() {
    return "data-rest";
  }
  static get properties() {
    return {
      debug: {
        type: Boolean
      },

      data: {
        type: Object,
        readOnly: true,
        notify: true,
        value: () => {
          return Immutable.fromJS({
            data: null,
            errors: null,
            extensions: null,
            schema: null
          });
        },
        computed: "_computeData(lastResponse)",
        observer: "_dataChanged"
      },

      onError: {
        type: Object,
        readOnly: true,
        notify: true,
        computed: "_computeError(lastError)"
      }
    };
  }

  _computeData(data) {
    if (data == null) {
      return;
    }
    if (this.debug)
      console.log("DATA-REST> computing data from last-response:", data);
    return Immutable.fromJS({
      data: data,
      errors: null,
      extensions: null,
      schema: null
    });
  }

  _dataChanged(data) {
    let event = new CustomEvent("on-data-changed", { detail: data });
    this.dispatchEvent(event);
  }

  _computeError(err) {
    return err;
  }
}

window.customElements.define(DataRest.is, DataRest);
