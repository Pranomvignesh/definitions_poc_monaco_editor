(function(global) {
    function getUserIdInternal() {
        return "userId";
    }
    global.ZCRM = {
        getUser : function() {
            return getUserIdInternal();
        },
        sampleProperty : 'value',
        sampleObject : {
            func : function(){
                return true
            }
        }
    }
})(self)