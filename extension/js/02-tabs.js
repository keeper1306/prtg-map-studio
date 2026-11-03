
/* @region: tabs -- a tab registers once: TABS.register({id, button, api, open, [onClick], [beforeLeave]}). It needs its button in the tab bar and its own panel. */
var TABS={
  list:[],
  register:function(t){
    var b=document.getElementById(t.button);
    this.list.push(t);
    if(b)b.addEventListener('click',t.onClick||function(){TABS.show(t.id);});
  },
  show:function(id){
    var t=null;
    this.list.forEach(function(o){if(o.id===id)t=o;});
    if(!t)return;
    this.list.forEach(function(o){if(o!==t&&o.beforeLeave)o.beforeLeave();});
    this.list.forEach(function(o){if(o!==t&&o.api.active)o.api.leave();});
    this.list.forEach(function(o){var e=document.getElementById(o.button);if(e)e.classList[o===t?'add':'remove']('on');});
    t.open();
  }
};
/* @endregion: tabs */
