/**
 * Created by michaelconner on 9/10/15.
 */
$(document).ready(function(){
    soundManager.setup({
        url: '/swf/',
        onready: function() {
            //var mySound = soundManager.createSound({
            //    id: 'aSound',
            //    url: "https://woodshedradio.blob.core.windows.net/mpc-test-container/04%20The%20Sun%20Ain't%20Gonna%20Shine%20Anymore1438992438659.m4a"
            //});
            //mySound.play();
        },
        ontimeout: function() {
            // Hrmm, SM2 could not start. Missing SWF? Flash blocked? Show an error, etc.?
        }
    });
});