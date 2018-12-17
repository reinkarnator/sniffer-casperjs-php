function lgc_init_info(el)
{
    if ("info_div" in el) return true;
    if (document.readyState=="complete")
    {
        el.info_div=el.parentNode.getElementsByClassName("info").item(0);
        els=el.info_div.getElementsByTagName("SPAN");
        el.info_x=els[0];
        el.info_y=els[1];
        el.min_x=Number(el.getAttribute("min_x"));
        el.range_x=Number(el.getAttribute("max_x"))-el.min_x;
        el.min_y=Number(el.getAttribute("min_y"));
        el.range_y=Number(el.getAttribute("max_y"))-el.min_y;
        return true;
    } 
    else
        return false;
}
function lgc_move(info_div)
{
    if (info_div.style.left=="5px")
    {
        info_div.style.left="";
        info_div.style.right="5px";
    }
    else
    {
        info_div.style.right="";
        info_div.style.left="5px";
    }        
}
function lgc_disable_info(el,event)
{
    if ("info_div" in el) el.info_div.style.display="none";
}
function lgc_update_info(el,event)
{
    if (lgc_init_info(el))
    {
        r=el.getBoundingClientRect();
        x=Math.floor(event.clientX-r.left);
        y=Math.floor(event.clientY-r.top);
        ts=Math.floor(x*el.range_x/(el.width-1))+el.min_x;
        d=new Date(); d.setTime(ts*1000);
        if (el.range_x<172800)
            el.info_x.innerHTML=d.strftime("%H:%M");
        else
            el.info_x.innerHTML=d.strftime("%d %b<br/>%H:%M");
        y_val=(el.height-1-y)*el.range_y/(el.height-1)+el.min_y;
        if (Math.abs(y_val)>100) 
            y_val=Math.floor(y_val);
        else 
            y_val=Math.floor(10*y_val)/10;
        el.info_y.innerHTML=y_val;
        el.info_div.style.display="";
    }
}

function lgc_scroll_graph(el,x)
{
    if (lgc_init_info(el))
    {
        r=el.getBoundingClientRect();
        x-=r.left;
        x=Math.floor(x*el.range_x/(el.width-1))+el.min_x;
        while((el=el.parentNode) && (el.nodeName!="FORM"));
        el.firstChild.nextSibling.value=x;
        $('#line_graph').submit();
    }
}
function lgc_enable_selector(el)
{
    el2=el.previousSibling.previousSibling;
    if (el2.nodeName!="DIV") el.style.display="none";
    el2.style.display="";
}
function lgc_alignY()
{
    els=document.querySelectorAll("td[name=line_graph_y]");
    width=0; n=els.length;
    for(i=0;i<n;i++)
    {
        w=parseInt(window.getComputedStyle(els[i]).width);
        if (width<w) width=w;
    }
    for(i=0;i<n;i++)
        els[i].style.width=width+'px';
}
