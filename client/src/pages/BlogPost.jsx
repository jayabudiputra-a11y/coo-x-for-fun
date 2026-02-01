import React,{useEffect,useState}from'react'
import{useParams,Link}from'react-router-dom'
import{motion}from'framer-motion'
import{supabase as S}from'../supabaseClient'
import SEOHelper from'../components/SEO/SEOHelper'
import{useTranslation as T}from'react-i18next'
import{getLocalized as G}from'../utils/langHelper'

const A=()=>{
const{slug:x}=useParams()
const[p,y]=useState(null)
const[l,z]=useState(true)
const{ i18n:w,t:v}=T()

useEffect(()=>{(async()=>{z(true);const{data:d}=await S.from('blog_posts').select('*').eq('slug',x).single();y(d);z(false)})()},[x,w.language])

if(l)return<motion.div initial={{opacity:0}} animate={{opacity:1}} style={{padding:'50px',textAlign:'center',color:'#fff'}}>{v('common.loading')}</motion.div>
if(!p)return<motion.div initial={{opacity:0}} animate={{opacity:1}} style={{padding:'50px',textAlign:'center',color:'#fff'}}>Article Not Found</motion.div>

const h=G(p,'title',w.language)
const c=G(p,'content',w.language)

const s={
w:{maxWidth:'480px',margin:'0 auto',padding:'20px 15px 100px'},
b:{display:'inline-block',background:'#ff00ff',color:'#fff',padding:'10px 15px',fontSize:'11px',fontWeight:'bold',textDecoration:'none',border:'2px solid #000',boxShadow:'4px 4px 0 #000',marginBottom:'20px'},
k:{background:'#fff',borderRadius:'20px',overflow:'hidden',boxShadow:'0 15px 35px rgba(0,0,0,.2)'},
t:{background:'#ff4d00',color:'#fff',padding:'25px 20px',textAlign:'center',fontSize:'20px',textTransform:'uppercase',letterSpacing:'1px',margin:0},
i:{width:'100%',display:'block',borderBottom:'6px solid #ff4d00'},
c:{padding:'30px'},
bd:{display:'inline-block',background:'#000',color:'#ff4d00',padding:'5px 12px',fontSize:'10px',fontWeight:900,borderRadius:'4px',marginBottom:'20px',border:'1px solid #ff4d00'},
d:{fontSize:'15px',lineHeight:1.8,color:'#444',marginBottom:'25px',textAlign:'justify',whiteSpace:'pre-line'},
hl:{background:'#fdf2f2',borderLeft:'4px solid #ff4d00',padding:'15px',margin:'20px 0',fontStyle:'italic',fontSize:'14px'},
dl:{margin:'0 0 25px',padding:0},
dlg:{padding:'12px 0',borderBottom:'1px solid #eee'},
dt:{color:'#000',display:'block',marginBottom:'4px',fontSize:'12px',textTransform:'uppercase',fontWeight:'bold'},
dd:{margin:0,fontSize:'14px',color:'#555'}
}

return(
<div style={{background:'#0d0d0d',minHeight:'100vh'}}>
<SEOHelper title={h} description={c.substring(0,150)} image={p.image_url}/>
<div style={s.w}>
<motion.div initial={{x:-30,opacity:0}} animate={{x:0,opacity:1}}>
<Link to="/blog" style={s.b}>{v('common.back')} TO LIST</Link>
</motion.div>
<motion.article initial={{y:40,opacity:0}} animate={{y:0,opacity:1}} transition={{duration:.5}} style={s.k}>
<motion.h1 initial={{scale:.9,opacity:0}} animate={{scale:1,opacity:1}} style={s.t}>{h}</motion.h1>
<motion.img src={p.image_url} alt={h} style={s.i} loading="lazy" initial={{opacity:0}} animate={{opacity:1}}/>
<div style={s.c}>
<motion.span initial={{scale:.8,opacity:0}} animate={{scale:1,opacity:1}} style={s.bd}>VERIFIED REVIEW</motion.span>
<motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.1}} style={s.d}>{c}</motion.p>
{w.language==='id'&&<>
{p.quote&&<motion.blockquote initial={{x:-20,opacity:0}} animate={{x:0,opacity:1}} style={s.hl}>"{p.quote}"</motion.blockquote>}
<motion.p initial={{opacity:0}} animate={{opacity:1}} style={s.d}>{p.content_secondary}</motion.p>
</>}
<dl style={s.dl}>
<div style={s.dlg}><dt style={s.dt}>LOCATION</dt><dd style={s.dd}>{p.location||'-'}</dd></div>
<div style={s.dlg}><dt style={s.dt}>OPENING HOURS</dt><dd style={s.dd}>{p.opening_hours||'-'}</dd></div>
<div style={s.dlg}><dt style={s.dt}>PRICE</dt><dd style={s.dd}>{p.price_range||'-'}</dd></div>
</dl>
<motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} style={{marginTop:'30px',paddingTop:'25px',borderTop:'2px dashed #eee'}}>
<a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noreferrer" style={{display:'block',background:'#1877F2',color:'#fff',textAlign:'center',padding:'16px',borderRadius:'12px',textDecoration:'none',fontWeight:'bold',fontSize:'14px'}}>SHARE ON FACEBOOK</a>
</motion.div>
</div>
</motion.article>
</div>
</div>
)}

export default A