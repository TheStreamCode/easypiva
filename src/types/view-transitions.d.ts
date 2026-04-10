/**
 * Type augmentation for View Transitions API
 * @see https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API
 */

interface ViewTransition {
  finished: Promise<void>;
  ready: Promise<void>;
  updateCallbackDone: Promise<void>;
}

declare global {
  interface Document {
    startViewTransition?(updateCallback: () => void | Promise<void>): ViewTransition;
  }
}

export {};
