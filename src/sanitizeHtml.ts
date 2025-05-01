import sanitizeHtmlLibrary = require("sanitize-html");

type SanitizeStylesType =
  | { [index: string]: { [index: string]: RegExp[] } }
  | undefined;

type SanitizeClassListType =
  | { [index: string]: boolean | Array<string | RegExp> }
  | undefined;

const DEFAULT_SANITIZE_TAGS = sanitizeHtmlLibrary.defaults.allowedTags.concat([
  "body",
  "button",
  "form",
  "img",
  "input",
  "select",
  "textarea",
  "option",
]);

const DEFAULT_SANITIZE_STYLES: SanitizeStylesType = undefined;

const DEFAULT_SANITIZE_CLASS_LIST: SanitizeClassListType = undefined;

export function getSanitizeOptions(): sanitizeHtmlLibrary.IOptions {
  return {
    // The default allowedTags list already includes _a lot_ of commonly used tags.
    // https://www.npmjs.com/package/sanitize-html#default-options
    //
    // I don't see a need for this to be configurable at the moment,
    // as it already covers all the layout tags, but we can revisit this if necessary.
    allowedTags: DEFAULT_SANITIZE_TAGS,
    // Setting allowedAttributes to false will allow all attributes.
    allowedAttributes: false,
    allowedClasses: DEFAULT_SANITIZE_CLASS_LIST,
    allowedStyles: DEFAULT_SANITIZE_STYLES,
  };
}

/**
 * The reason for sanitization is because OpenAI does not need all of the HTML tags
 * to know how to interpret the website, e.g. it will not make a difference to AI if
 * we include or exclude <script> tags as they do not impact the already rendered DOM.
 *
 * In my experience, reducing HTML only to basic tags produces faster and more reliable prompts.
 *
 * Note that the output of this function is designed to interpret only the HTML tags.
 * For instructions that rely on visual cues (e.g. "click red button") we intend to
 * combine HTML with screenshots in the future versions of this library.
 */
export const sanitizeHtml = (subject: string) => {
  return sanitizeHtmlLibrary(subject, getSanitizeOptions());
};
