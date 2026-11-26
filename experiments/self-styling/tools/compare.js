/* Checks that the code copied out of 09-objects.js builds byte for byte the file Map Studio itself builds, for each type's
   default and for each look. node compare.js [type ...] */
const K=require('./kitrun'), O=require('./obx');
const TYPES={gauge:['buildGauge','blankG'],donut:['buildDonut','blankD'],status:['buildStatus','blankSC'],tile:['buildTile','blankTL'],
  icon:['buildIcon','blankI'],sunburst:['buildSunburst','blankSB'],graph:['buildGraph','blankGR'],table:['buildTable','blankT']};
(async()=>{
  const want=process.argv.slice(2).length?process.argv.slice(2):Object.keys(TYPES);
  const o=await O.open();
  let bad=0;
  try{
    const looks=await o.ev('LOOKORDER');
    for(const ty of want){
      const [bf,blank]=TYPES[ty];
      const k=K.make(ty,[bf,blank,'flexAppend']);
      for(const lk of [null].concat(looks)){
        /* the extension: that type's blank model with the look, built as the page builds it */
        const ext=await o.ev('(function(){setType('+JSON.stringify(ty)+');var m=M();var b='+blank+'();for(var x in m)delete m[x];for(var y in b)m[y]=b[y];'
          +(lk?'lookSet(m,lookOf('+JSON.stringify(lk)+'));':'')+'return {m:JSON.parse(JSON.stringify(m)),text:codeNow()};})()');
        const m=k.use(JSON.parse(JSON.stringify(ext.m)));
        const mine=k.flexAppend(k[bf](m));
        const same=mine===ext.text;
        if(!same){bad++;let i=0;while(i<mine.length&&mine[i]===ext.text[i])i++;
          console.log('DIFF',ty,lk||'(default)','at',i,'\n mine:',JSON.stringify(mine.slice(Math.max(0,i-80),i+120)),'\n ext :',JSON.stringify(ext.text.slice(Math.max(0,i-80),i+120)));}
      }
      console.log(ty,'kit',k.__kit.text.length,'bytes;',looks.length+1,'files compared');
    }
    if(o.errs.length)console.log('page errors:',o.errs.slice(0,5));
  }finally{await o.close();}
  console.log(bad?bad+' files differ':'all identical');
  process.exit(bad?1:0);
})();
