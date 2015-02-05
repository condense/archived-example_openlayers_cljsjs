
This is an experiment in compiling openlayers v3 into your app directly.  

There are file size benefits to this.  Based on the getting started example provided by OL3 the filesize is improved from 539K to 247K when we switch out the cljsjs/openlayers library and compile openlayers ourselves.


# Concept only!

Openlayers is built on Google Closure but doesn't follow the source file conventions required for compilation with cljs.  Turns out it's two problems: file names don't match package provided, and files providing multiple namespaces.  

Through sheer bloody mindedness I proved it can work.  I scripted a "move file to location of goog.provides script" and manually teased apart the multi provide files.  Hours later, it worked!  Problem is that this new codebase is hard to keep up to date because of the file splitting.

End result, I pinged the OL3 dev list to share my experiences and ask about willingness to receive patches.  Not sure it's a priority for them.

https://groups.google.com/forum/#!topic/ol3-dev/TyhQqM-GlBM


