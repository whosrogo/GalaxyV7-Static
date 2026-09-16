function r(n){const[t,e]=String(n).split("?");return`./${t.replace(/^\/+/,"").replace(/\/+$/,"")||"index"}.html${e?"?"+e:""}`}export{r};
