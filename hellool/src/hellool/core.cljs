(ns hellool.core
  (:require [clojure.browser.repl :as repl]
            [hellool.examples]))

;; (repl/connect "http://localhost:9000/repl")

(enable-console-print!)

(println "Hello world!")

(hellool.examples/getting_started)
