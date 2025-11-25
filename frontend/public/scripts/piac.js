// Piac location scenes and logic

const piacScenes = [
    {type:'narrative', text:'Megérkeztél a piacra. A tér nyüzsög az élettel, árusok kiabálják portékáikat.'},
    {type:'narrative', text:'A piac tele van különféle árukkal: friss zöldségekkel, fűszerekkel és kézműves termékekkel.'},
    {type:'narrative', text:'A gyilkosság helyszínéről származó gyümölcsök itt vehette az áldozat, érdemes lehet körülnézni az árusok között.'},
    {type:'narrative', text:'Feltünés mentesen kellene nyomoznod mivel a gyilkosságnak még nem ment híre.'},
    {type:'narrative', text:'Ebben az időszakban elég kevés helyen lehet gyümölcsöt kapni. Kiszúrsz egy árust, aki friss gyümölcsöket kínál eladásra, mind olyan mint a gyilkosság helyszínén találtak. A standja úgy néz ki mintha éppen kirabolták volna.'},
    {type:'narrative', text:'Odamész az árushoz.'},
    {type:'choices', prompt:'Mit teszel?', choices:[
        {id:'ask_fruits', label:'Megszólítod az árust', nextScene: 7},
        {id:'ask_customers', label:'Kérdezel a vásárlókról', nextScene: 8},
        {id:'leave', label:'Visszatérsz a városi parkba', nextScene: 9}
    ]},
    {type:'narrative', text:'Odamész az árushoz, aki éppen nagy erővel pakolja a pultját de felnéz rád és mosolyogva fogad.'},
    {type:'narrative', text:'Jó napot! Mit parancsol? Friss gyümölcsöket kínálok, ennél jobbat nem talál.', image:'pictures/characters/piaci_arus.png'},
    {type:'choices', prompt:'Mit kérdezel?', image:'pictures/characters/piaci_arus.png', choices:[
        {id:'ask_sold', label:'Kérdezel hogy vásárolt ma itt egy cseléd', nextScene: 10},
        {id:'ask_quality', label:'Kérdezel mi történt a putjánál', nextScene: 11},
        {id:'end_talk', label:'Befejezed a beszélgetést', nextScene: 6}
    ]},
    {type:'narrative', text:'Na de kérem! Tudja maga hányan vásárolnak nálam? Ennél több információra lenne szükségem.', image:'pictures/characters/piaci_arus.png'},
    {type:'narrative', text:'Elég mérges lett az árus, inkább tovább pakolja a standot', nextScene: 9}
];

const piacBackground = 'pictures/piac.png';
