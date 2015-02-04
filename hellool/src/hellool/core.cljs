(ns hellool.core
  (:require [clojure.browser.repl :as repl]

            ; GOTCHA: Can't goog.require(cljsjs.openlayers) from js, use a cljs require.
            [cljsjs.openlayers]
            [hellool.examples]))

;; (repl/connect "http://localhost:9000/repl")

(enable-console-print!)

(println "Hello world!")

(hellool.examples/getting_started)
