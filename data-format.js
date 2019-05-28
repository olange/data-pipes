import { html } from "@polymer/polymer/lib/utils/html-tag.js";
import { PolymerElement } from "@polymer/polymer/polymer-element.js";
import { afterNextRender } from "@polymer/polymer/lib/utils/render-status.js";
/*
`<data-format>` formats some data according to the schema and locale
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
class DataFormat extends PolymerElement {
  static get is() {
    return "data-format";
  }
  static get properties() {
    return {
      in: {
        type: Object,
        observer: "_dataIn",
        notify: false,
        readOnly: false
      },
      lang: {
        type: String,
        value: "en-EN",
        notify: false,
        readOnly: false
      },
      out: {
        type: Object,
        computed: "_format(in, lang)",
        observer: "_outChanged",
        notify: true,
        readOnly: true
      }
    };
  }

  ready() {
    super.ready();
    //Console.log("PAGL-DATA-FORMAT> I'm ready to format some data.");
  }

  _dataIn(dataNugget) {
    //Console.log("PAGL-DATA-FORMAT> dataNugget received with lang '"+this.lang+"'", dataNugget);
  }

  _format(dataIn, lang) {
    if (!dataIn) {
      return;
    } // We need to have at least the input
    console.log("PAGL-DATA-FORMAT> [STUB] formatting data in lang=" + lang);
    return dataIn;
  }

  _outChanged(out) {
    let event = new CustomEvent("on-data-changed", { detail: out });
    this.dispatchEvent(event);
  }
}

customElements.define(DataFormat.is, DataFormat);
