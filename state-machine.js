function StateMachine(description, name){
    for(var prop in description){
        this[prop] = description[prop];
    }
    this.name = name;
}

StateMachine.prototype.transition = function(toState){
    this.state = toState;
    var handlers = this.states[this.state];
    if( handlers.init ){
        handlers.init();
    }
};

module.exports = StateMachine;