const kindOf = require('kind-of')

function createBus(dependencies) {
  let {
    process
  } = dependencies

  let handlerMap = {}

  let observeFuncs = []

  let handlers = (toName) => {
    handlerMap[toName] = handlerMap[toName] || {
      call: null,
      callback: {},
      callbackError: {}
    }
    return handlerMap[toName]
  }

  function onCall(isPure, toName, body) {
    handlers(toName).call = { body, isPure }

    function onCallback(fromName, body) {
      handlers(toName).callback[fromName] = { body, isPure }
      return { onCallback }
    }

    function onCallbackError(callbackName, errorName, body) {
      handlers(toName).callbackError[`${callbackName}/${errorName}`] = { body }
    }

    return { onCallback, onCallbackError }
  }

  function observe(fn) {
    observeFuncs.push(fn)
  }

  async function processJuncture(shallow, juncture) {
    if (!juncture) {
      const err = new Error('processJuncture was called without a juncture!')
      err.type = 'juncture-not-provided'
      err.juncture = juncture
      throw err
    }

    if (!juncture.call) {
      const err = new Error('call property was missing from juncture')
      err.type = 'missing-call-property'
      err.juncture = juncture
      throw err
    }

    if (!Array.isArray(juncture.call)) {
      const err = new Error('juncture call property must be an array')
      err.type = 'invalid-call-property'
      err.juncture = juncture
      throw err
    }

    if (juncture.call.length < 1 || juncture.call.length > 2) {
      const err = new Error('juncture call property must be an array with length 1 or 2')
      err.type = 'invalid-call-property'
      err.juncture = juncture
      throw err
    }

    if (juncture.callback && !Array.isArray(juncture.callback)) {
      const err = new Error('juncture callback property must be an array')
      err.type = 'invalid-callback-property'
      err.juncture = juncture
      throw err
    }
    if (juncture.callbackError && !Array.isArray(juncture.callbackError)) {
      const err = new Error('juncture callbackError property must be an array')
      err.type = 'invalid-callback-error-property'
      err.juncture = juncture
      throw err
    }

    const [ callName, callPayload ] = juncture.call
    const [ callbackName, callbackPayload ] = juncture.callback || []
    const [ errorcallbackName, errorName, errorPayload ] = juncture.callbackError || []

    if (errorcallbackName && !(isString(errorcallbackName) && isString(errorName))) {
      const err = new Error('callbackError property of juncture should be array beginning with two strings (callback name and error name)')
      err.juncture = juncture
      err.type = 'invalid-error-property'
      throw err
    }

    const payload = errorPayload || callbackPayload || callPayload

    let handler
    if (errorcallbackName && errorName)
      handler = handlers(callName).callbackError[`${errorcallbackName}/${errorName}`]
    else if (callbackName)
      handler = handlers(callName).callback[callbackName]
    else
      handler = handlers(callName).call

    const notifyAndThrowHandlingError = error => {
      const resolution = {
        input: juncture,
        handlingError: {
          message: error.message,
          type: error.type
        }
      }
      observeFuncs.forEach(fn => fn(resolution))
      throw error
    }

    if (!handler) notifyAndThrowHandlingError(
      !!callbackName
        ? (() => {
          const err = new Error(`call handler "${callName}" was not awaiting a callback from "${callbackName}".`)
          err.juncture = juncture
          err.type = 'no-callback-handler'
          return err
        })()
        : (() => {
          const err = new Error(`No handler found for call named "${callName}"`)
          err.juncture = juncture
          err.type = 'no-call-handler'
          return err
        })()
    )

    if (payload && process.env.NODE_ENV === 'development') {
      const invalidProperty = findInvalidProperty(null, payload)
      if (invalidProperty) {
        notifyAndThrowHandlingError(
          !!invalidProperty.name
            ? new Error(
              `Payload of call "${callName}" contained ` +
              `property "${invalidProperty.name}" that was of ` +
              `disallowed kind "${invalidProperty.kind}".`
            )
            : new Error(
              `Payload of call "${callName}" ` +
              `was of disallowed kind "${invalidProperty.kind}".`
            )
        )

      }
    }

    let unresolvedHandlerResult = handler.body(payload, juncture.state)

    if (handler.isPure && isPromise(unresolvedHandlerResult))
      throw new Error('Handler must be marked as impure in order to return promises')

    let handlerResult = await unresolvedHandlerResult

    if (handlerResult === null) {
      return
    }

    const notifyValidResolution = () => {
      const resolution = {
        input: juncture,
        output: handlerResult
      }
      observeFuncs.forEach(fn => fn(resolution))
    }

    const notifyAndThrowInvalidResolution = error => {
      const resolution = {
        input: juncture,
        output: handlerResult,
        validationError: {
          message: error.message,
          type: error.type
        }
      }
      observeFuncs.forEach(fn => fn(resolution))
      throw error
    }

    if (isUndefined(handlerResult)) {

      if (handler.isPure) {
        /* Returning undefined from a function makes sense if there is some kind of
        side effect involved, but for pure handlers, undefined is does not make sense.
        */
        if (juncture.callback) {
          let err = new Error(
            `Pure handler for callback "${callbackName}" of ` +
            `call "${callName}" returned undefined. ` +
            `If you really intended to return a the concept of nothing, return null instead.`
          )
          err.type = 'pure-callback-handler-returned-undefined'
          notifyAndThrowInvalidResolution(err)
        }
        let err = new Error(`Pure handler for call "${callName}" returned undefined. If you really intended to return a the concept of nothing, return null instead.`)
        err.type = 'pure-call-handler-returned-undefined'
        notifyAndThrowInvalidResolution(err)
      }
      return
    }

    const callIntent = ascallIntent(handlerResult)
    if (callIntent && !shallow) {
      /*
        A call intent is a hash table returned by a handler body
        that represents a call that handler wants performed,
        and an optional $setState, which is a manipulation of the
        state shared between the call handler and it's callback handlers.

        Example:

        bus.onCall('assemble-greeting', () => ({
          $call: 'get-second-greeting',
          $setState: {
            firstGreeting: 'yay'
          }
        }))
      */

      if(isPromise(unresolvedHandlerResult))
        notifyAndThrowInvalidResolution(new Error('Promises returned by handlers cannot resolve to calls'))

      if (callIntent.$setState) {
        if (!isPlainObject(callIntent.$setState)) {
          notifyAndThrowInvalidResolution(new Error(
            `${callName} call handler returned a call intent where $setState ` +
            `was of kind ${kindOf(callIntent.$setState)} (must be plain object).`
          ))
        }
      }

      notifyValidResolution()

      const nextJuncture = {
        call:
          isString(callIntent.$call)
            ? [ callIntent.$call ]
            : callIntent.$call,
        callor: Object.assign({}, juncture, {
          state: Object.assign({}, juncture.state, callIntent.$setState)
        })
      }
      return await processJuncture(false, nextJuncture)
    }

    if (handlerResult.$error) {
      if (
        !isString(handlerResult.$error) &&
        !(
          Array.isArray(handlerResult.$error) &&
          handlerResult.$error.length > 0 &&
          handlerResult.$error.length < 3
        )
      ) {
        notifyAndThrowInvalidResolution(new Error('Error intent must be a string or an array of length 1 or 2'))
      }

      notifyValidResolution()

      if (juncture.callor) {
        return await processJuncture(false, Object.assign({}, juncture.callor, {
          callbackError: [callName].concat(handlerResult.$error)
        }))
      } else {
        return handlerResult
      }
    }

    // If we get this far, the return value from the handler
    // is assumed to be a callback.

    if (process.env.NODE_ENV === 'development') {
      // Since this validation is a bit expensive, it's disabled
      // in producton

      if (handlerResult.setState) {
        notifyAndThrowInvalidResolution(new Error(
          `Handler for call "${callName}" returned an object with ` +
          'property "setState" - did you mean "$setState"?'
        ))
      }

      if (handlerResult.call) {

        notifyAndThrowInvalidResolution(new Error(
          `Handler for call "${callName}" returned an object with ` +
          'property "call" - did you mean "$call"?'
        ))
      }

      const invalidProperty = findInvalidProperty(null, handlerResult)
      if (invalidProperty) {
        const subject =
          !!callbackName
            ? `Handler of callback from "${callbackName}" to "${callName}"`
            : `Handler of call "${callName}"`
        if (!invalidProperty.name) {
          notifyAndThrowInvalidResolution(new Error(
            `${subject} returned a callback that was of disallowed kind "${invalidProperty.kind}".`
          ))
        }
        notifyAndThrowInvalidResolution(new Error(
          `${subject} returned a callback with ` +
          `property "${invalidProperty.name}" that was of ` +
          `disallowed kind "${invalidProperty.kind}".`
        ))
      }
    }

    notifyValidResolution()

    if (!juncture.callor) {
      // There is no callor, which means that we are at the root
      // of the call graph - just return the value
      return handlerResult
    } else {
      // callor is a juncture that is waiting for a callback,
      // extend it with the callback and process it
      return await processJuncture(false, Object.assign({}, juncture.callor, {
        callback: [ callName, handlerResult ]
      }))
    }
  }

  return {
    observe,
    processJuncture: processJuncture.bind(null, false),
    processJunctureShallow: processJuncture.bind(null, true),
    onCall: onCall.bind(null, true),
    call: (name, payload) => processJuncture(false, {
      call: [ name, payload ]
    }),
    impure: {
      onCall: onCall.bind(null, false),
    }
  }
}

const ascallIntent = x => (isString(x.$call) || Array.isArray(x.$call)) && x
const isPromise = x => Promise.resolve(x) == x
const isUndefined = x => typeof x === 'undefined'
const isFunction = x => typeof x === 'function'
const isString = x => Object.prototype.toString.call(x) === '[object String]'
const isPlainObject = x => typeof x == 'object' && x.constructor == Object
const isObject = x => typeof x === 'object' && x !== null

function findInvalidProperty(propertyName, x) {
  const kind = kindOf(x)
  const invalidKind =
    kind !== 'number' &&
    kind !== 'boolean' &&
    kind !== 'null' &&
    kind !== 'string' &&
    kind !== 'object' &&
    kind

  if (invalidKind) {
    return {
      name: propertyName,
      kind
    }
  }
  if (isObject(x)) {
    if(!isPlainObject(x)) {
      return {
        name: propertyName,
        kind: 'non-plain'
      }
    }
    for (let key in x) {
      const invalidProp = findInvalidProperty(key, x[key])
      if (invalidProp) return invalidProp
    }
  }
}

module.exports = {
  createBus
}