 function getLang( element ) {
     while ( element && !lang.test( element.className ) ) {
       element = element.parentElement;
     }
     if ( element ) {
       return ( element.className.match( lang ) || [ , "none" ] )[ 1 ].toLowerCase();
     }
     return "none";
};
let code = document.getElementsByTagName( 'code' );
getLang("code")



 function currentScript() {
        if ( typeof document === "undefined" ) {
          return null;
        }
        if (
          "currentScript" in document &&
          1 < 2 /* hack to trip TS' flow analysis */
        ) {
          return /** @type {any} */ ( document.currentScript );
        }

        // IE11 workaround
        // we'll get the src of the current script by parsing IE11's error stack trace
        // this will not work for inline scripts

        try {
          throw new Error();
        } catch ( err ) {
          // Get file src url from stack. Specifically works with the format of stack traces in IE.
          // A stack will look like this:
          //
          // Error
          //    at _.util.currentScript (http://localhost/components/prism-core.js:119:5)
          //    at Global code (http://localhost/components/prism-core.js:606:1)

          var src = ( /at [^(\r\n]*\((.*):.+:.+\)$/i.exec( err.stack ) || [] )[ 1 ];
          if ( src ) {
            var scripts = document.getElementsByTagName( "script" );
            for ( var i in scripts ) {
              if ( scripts[ i ].src == src ) {
                return scripts[ i ];
              }
            }
          }
          return null;
        }
};
 /**
  * Returns whether a given class is active for `element`.
  *
  * The class can be activated if `element` or one of its ancestors has the given class and it can be deactivated
  * if `element` or one of its ancestors has the negated version of the given class. The _negated version_ of the
  * given class is just the given class with a `no-` prefix.
  *
  * Whether the class is active is determined by the closest ancestor of `element` (where `element` itself is
  * closest ancestor) that has the given class or the negated version of it. If neither `element` nor any of its
  * ancestors have the given class or the negated version of it, then the default activation will be returned.
  *
  * In the paradoxical situation where the closest ancestor contains __both__ the given class and the negated
  * version of it, the class is considered active.
  *
  * @param {Element} element
  * @param {string} className
  * @param {boolean} [defaultActivation=false]
  * @returns {boolean}
  */
 isActive: function ( element, className, defaultActivation ) {
   var no = "no-" + className;

   while ( element ) {
     var classList = element.classList;
     if ( classList.contains( className ) ) {
       return true;
     }
     if ( classList.contains( no ) ) {
       return false;
     }
     element = element.parentElement;
   }
   return !!defaultActivation;
 },
 },

 /**
  * This namespace contains all currently loaded languages and the some helper functions to create and modify languages.
  *
  * @namespace
  * @memberof Prism
  * @public
  */
 languages: {
     /**
      * Creates a deep copy of the language with the given id and appends the given tokens.
      *
      * If a token in `redef` also appears in the copied language, then the existing token in the copied language
      * will be overwritten at its original position.
      *
      * ## Best practices
      *
      * Since the position of overwriting tokens (token in `redef` that overwrite tokens in the copied language)
      * doesn't matter, they can technically be in any order. However, this can be confusing to others that trying to
      * understand the language definition because, normally, the order of tokens matters in Prism grammars.
      *
      * Therefore, it is encouraged to order overwriting tokens according to the positions of the overwritten tokens.
      * Furthermore, all non-overwriting tokens should be placed after the overwriting ones.
      *
      * @param {string} id The id of the language to extend. This has to be a key in `Prism.languages`.
      * @param {Grammar} redef The new tokens to append.
      * @returns {Grammar} The new language created.
      * @public
      * @example
      * Prism.languages['css-with-colors'] = Prism.languages.extend('css', {
      *     // Prism.languages.css already has a 'comment' token, so this token will overwrite CSS' 'comment' token
      *     // at its original position
      *     'comment': { ... },
      *     // CSS doesn't have a 'color' token, so this token will be appended
      *     'color': /\b(?:red|green|blue)\b/
      * });
      */
     extend: function ( id, redef ) {
       var lang = _.util.clone( _.languages[ id ] );

       for ( var key in redef ) {
         lang[ key ] = redef[ key ];
       }

       return lang;
     },

     /**
      * Inserts tokens _before_ another token in a language definition or any other grammar.
      *
      * ## Usage
      *
      * This helper method makes it easy to modify existing languages. For example, the CSS language definition
      * not only defines CSS highlighting for CSS documents, but also needs to define highlighting for CSS embedded
      * in HTML through `<style>` elements. To do this, it needs to modify `Prism.languages.markup` and add the
      * appropriate tokens. However, `Prism.languages.markup` is a regular JavaScript object literal, so if you do
      * this:
      *
      * ```js
      * Prism.languages.markup.style = {
      *     // token
      * };
      * ```
      *
      * then the `style` token will be added (and processed) at the end. `insertBefore` allows you to insert tokens
      * before existing tokens. For the CSS example above, you would use it like this:
      *
      * ```js
      * Prism.languages.insertBefore('markup', 'cdata', {
      *     'style': {
      *         // token
      *     }
      * });
      * ```
      *
      * ## Special cases
      *
      * If the grammars of `inside` and `insert` have tokens with the same name, the tokens in `inside`'s grammar
      * will be ignored.
      *
      * This behavior can be used to insert tokens after `before`:
      *
      * ```js
      * Prism.languages.insertBefore('markup', 'comment', {
      *     'comment': Prism.languages.markup.comment,
      *     // tokens after 'comment'
      * });
      * ```
      *
      * ## Limitations
      *
      * The main problem `insertBefore` has to solve is iteration order. Since ES2015, the iteration order for object
      * properties is guaranteed to be the insertion order (except for integer keys) but some browsers behave
      * differently when keys are deleted and re-inserted. So `insertBefore` can't be implemented by temporarily
      * deleting properties which is necessary to insert at arbitrary positions.
      *
      * To solve this problem, `insertBefore` doesn't actually insert the given tokens into the target object.
      * Instead, it will create a new object and replace all references to the target object with the new one. This
      * can be done without temporarily deleting properties, so the iteration order is well-defined.
      *
      * However, only references that can be reached from `Prism.languages` or `insert` will be replaced. I.e. if
      * you hold the target object in a variable, then the value of the variable will not change.
      *
      * ```js
      * var oldMarkup = Prism.languages.markup;
      * var newMarkup = Prism.languages.insertBefore('markup', 'comment', { ... });
      *
      * assert(oldMarkup !== Prism.languages.markup);
      * assert(newMarkup === Prism.languages.markup);
      * ```
      *
      * @param {string} inside The property of `root` (e.g. a language id in `Prism.languages`) that contains the
      * object to be modified.
      * @param {string} before The key to insert before.
      * @param {Grammar} insert An object containing the key-value pairs to be inserted.
      * @param {Object<string, any>} [root] The object containing `inside`, i.e. the object that contains the
      * object to be modified.
      *
      * Defaults to `Prism.languages`.
      * @returns {Grammar} The new grammar object.
      * @public
      */
     insertBefore: function ( inside, before, insert, root ) {
       root = root || /** @type {any} */ ( _.languages );
       var grammar = root[ inside ];
       /** @type {Grammar} */
       var ret = {};

       for ( var token in grammar ) {
         if ( grammar.hasOwnProperty( token ) ) {
           if ( token == before ) {
             for ( var newToken in insert ) {
               if ( insert.hasOwnProperty( newToken ) ) {
                 ret[ newToken ] = insert[ newToken ];
               }
             }
           }

           // Do not insert token which also occur in insert. See #1525
           if ( !insert.hasOwnProperty( token ) ) {
             ret[ token ] = grammar[ token ];
           }
         }
       }

       var old = root[ inside ];
       root[ inside ] = ret;

       // Update references in other language definitions
       _.languages.DFS( _.languages, function ( key, value ) {
         if ( value === old && key != inside ) {
           this[ key ] = ret;
         }
       } );

       return ret;
     },

     // Traverse a language definition with Depth First Search
     DFS: function DFS( o, callback, type, visited ) {
       visited = visited || {};

       var objId = _.util.objId;

       for ( var i in o ) {
         if ( o.hasOwnProperty( i ) ) {
           callback.call( o, i, o[ i ], type || i );

           var property = o[ i ],
             propertyType = _.util.type( property );

           if ( propertyType === "Object" && !visited[ objId( property ) ] ) {
             visited[ objId( property ) ] = true;
             DFS( property, callback, null, visited );
           } else if ( propertyType === "Array" && !visited[ objId( property ) ] ) {
             visited[ objId( property ) ] = true;
             DFS( property, callback, i, visited );
           }
         }
       }
     },
   },

   plugins: {},

   /**
    * This is the most high-level function in Prism’s API.
    * It fetches all the elements that have a `.language-xxxx` class and then calls {@link Prism.highlightElement} on
    * each one of them.
    *
    * This is equivalent to `Prism.highlightAllUnder(document, async, callback)`.
    *
    * @param {boolean} [async=false] Same as in {@link Prism.highlightAllUnder}.
    * @param {HighlightCallback} [callback] Same as in {@link Prism.highlightAllUnder}.
    * @memberof Prism
    * @public
    */
   highlightAll: function ( async, callback ) {
     _.highlightAllUnder( document, async, callback );
   },

   /**
    * Fetches all the descendants of `container` that have a `.language-xxxx` class and then calls
    * {@link Prism.highlightElement} on each one of them.
    *
    * The following hooks will be run:
    * 1. `before-highlightall`
    * 2. `before-all-elements-highlight`
    * 3. All hooks of {@link Prism.highlightElement} for each element.
    *
    * @param {ParentNode} container The root element, whose descendants that have a `.language-xxxx` class will be highlighted.
    * @param {boolean} [async=false] Whether each element is to be highlighted asynchronously using Web Workers.
    * @param {HighlightCallback} [callback] An optional callback to be invoked on each element after its highlighting is done.
    * @memberof Prism
    * @public
    */
   highlightAllUnder: function ( container, async, callback ) {
     var env = {
       callback: callback,
       container: container,
       selector: 'code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code',
     };

     _.hooks.run( "before-highlightall", env );

     env.elements = Array.prototype.slice.apply(
       env.container.querySelectorAll( env.selector )
     );

     _.hooks.run( "before-all-elements-highlight", env );

     for ( var i = 0, element;
       ( element = env.elements[ i++ ] ); ) {
       _.highlightElement( element, async ===true, env.callback );
     }
   },

   /**
    * Highlights the code inside a single element.
    *
    * The following hooks will be run:
    * 1. `before-sanity-check`
    * 2. `before-highlight`
    * 3. All hooks of {@link Prism.highlight}. These hooks will be run by an asynchronous worker if `async` is `true`.
    * 4. `before-insert`
    * 5. `after-highlight`
    * 6. `complete`
    *
    * Some the above hooks will be skipped if the element doesn't contain any text or there is no grammar loaded for
    * the element's language.
    *
    * @param {Element} element The element containing the code.
    * It must have a class of `language-xxxx` to be processed, where `xxxx` is a valid language identifier.
    * @param {boolean} [async=false] Whether the element is to be highlighted asynchronously using Web Workers
    * to improve performance and avoid blocking the UI when highlighting very large chunks of code. This option is
    * [disabled by default](https://prismjs.com/faq.html#why-is-asynchronous-highlighting-disabled-by-default).
    *
    * Note: All language definitions required to highlight the code must be included in the main `prism.js` file for
    * asynchronous highlighting to work. You can build your own bundle on the
    * [Download page](https://prismjs.com/download.html).
    * @param {HighlightCallback} [callback] An optional callback to be invoked after the highlighting is done.
    * Mostly useful when `async` is `true`, since in that case, the highlighting is done asynchronously.
    * @memberof Prism
    * @public
    */
   highlightElement: function ( element, async, callback ) {
     // Find language
     var language = _.util.getLanguage( element );
     var grammar = _.languages[ language ];

     // Set language on the element, if not present
     element.className =
       element.className.replace( lang, "" ).replace( /\s+/g, " " ) +
       " language-" +
       language;

     // Set language on the parent, for styling
     var parent = element.parentElement;
     if ( parent && parent.nodeName.toLowerCase() === "pre" ) {
       parent.className =
         parent.className.replace( lang, "" ).replace( /\s+/g, " " ) +
         " language-" +
         language;
     }

     var code = element.textContent;

     var env = {
       element: element,
       language: language,
       grammar: grammar,
       code: code,
     };

     function insertHighlightedCode( highlightedCode ) {
       env.highlightedCode = highlightedCode;

       _.hooks.run( "before-insert", env );

       env.element.innerHTML = env.highlightedCode;

       _.hooks.run( "after-highlight", env );
       _.hooks.run( "complete", env );
       callback && callback.call( env.element );
     }

     _.hooks.run( "before-sanity-check", env );

     if ( !env.code ) {
       _.hooks.run( "complete", env );
       callback && callback.call( env.element );
       return;
     }

     _.hooks.run( "before-highlight", env );

     if ( !env.grammar ) {
       insertHighlightedCode( _.util.encode( env.code ) );
       return;
     }

     if ( async &&_self.Worker ) {
       var worker = new Worker( _.filename );

       worker.onmessage = function ( evt ) {
         insertHighlightedCode( evt.data );
       };

       worker.postMessage(
         JSON.stringify( {
           language: env.language,
           code: env.code,
           immediateClose: true,
         } )
       );
     } else {
       insertHighlightedCode( _.highlight( env.code, env.grammar, env.language ) );
     }
   },
