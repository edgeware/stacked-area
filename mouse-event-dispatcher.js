function MouseEventDispatcher(eventSource, /*params*/ machines){
    var args = Array.prototype.slice.call(arguments, 1);
    this.machines = args;
    for(var i in this.events){
        var eventName = this.events[i];
        eventSource.on(eventName, this.handle.bind(this, eventName));
    }
}

MouseEventDispatcher.prototype.events = ['mousedown', 'mouseup', 'mousemove', 'mousewheel', 'DOMMouseScroll', 'mouseout'];
MouseEventDispatcher.prototype.handle = function(eventName, e){
    for(var i in this.machines){
        var machine = this.machines[i];
        var state = machine.states[machine.state];
        var handler = state[eventName];
        if(handler){
            handler.call(machine, e);
        }
    }
};

module.exports = MouseEventDispatcher;