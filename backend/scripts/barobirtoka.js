// Báró birtoka location scenes and logic

const barobirtokaScenes = [
    {type:'narrative', text:'Megérkeztél a báró birtokára. A hatalmas kastély impozáns látványt nyújt.'},
    {type:'narrative', text:'A birtokon rengeteg ember sürög-forog, mintha valami fontos esemény készülődne. Lovaskocsik, szolgák és vendégek jönnek-mennek. De ez egy átlagos napnak tűnik a báró életében.'},
    {type:'narrative', text:'A kastély előtti kertben egy csoport ember gyülekezik, köztük a báró is. Úgy tűnik, hogy valami fontos megbeszélés zajlik.'},
    {type:'narrative', text:'Az érkezésedre felfigyel egy lovász fiú és odalép hozzád.'},
    {type:'narrative', text:'Üdvözlöm detektív úr! Én Thomas vagyok, a báró lovásza. A báró éppen nagyon elfoglalt, csak sürgős ügyben zavarnám meg csak!', image:'pictures/characters/thomas.png'},
    {type:'choices', prompt:'Mit teszel?', evidencePrompt: 'Nyomok kérdezése', choices:[
        {id:'talk_baron', label:'Megszólítod a bárót', nextScene: 12, condition: 'baronAvailable'},
        {id:'talk_thomas', label:'Megszólítod Thomast', nextScene: 27, condition: 'baronTalked'}
    ]},
    {type:'evidence_choices', prompt:'Melyik nyomról kérdezel?', image:'pictures/characters/thomas.png', choices:[
        {id:'kendo', label:'Kendő', nextScene: 7, requiresItem: 'Kendő'},
        {id:'kalapacs', label:'Kalapács', nextScene: 50, requiresItem: 'Kalapács'},
        {id:'gyumolcsok', label:'Gyümölcsök', nextScene: 54, requiresItem: 'Gyümölcsök'},
        {id:'back', label:'Vissza', nextScene: 5}
    ]},
    {type:'narrative', text:'Megmutatod Thomasnak a kendőt a báró címerével.'},
    {type:'narrative', text:'Thomas figyelmesen megnézi és ráismer.'},
    {type:'narrative', text:'Ez a mi címerünk! Ez Charlotte kisasszony kendője, én adtam neki személyesen.', image:'pictures/characters/thomas.png'},
    {type:'narrative', text:'Hogy érti hogy meggyilkolták? Reggel elment a piacra vásárolni, de azóta nem láttuk visszatérni. Vele tartott Sebastian is.', image:'pictures/characters/thomas.png'},
    {type:'narrative', text:'Thomas visszaadja neked a kendőt és elrohan szólni a bárónak aki ez után odamegy hozzád.', nextScene: 5, setState: {baronAvailable: true}},
    {type:'narrative', text:'Thomas bólint és visszamegy az istállóba.'},
    {type:'narrative', text:'Thomas a távolról tovább figyel, mintha rád várna.'},
    {type:'narrative', text:'Alex detektív! A lovász tájékoztatott érkezéséről és hogy a cseléd haláláról nyomoz. Hol a fiam aki vele tartott?', image:'pictures/characters/baro.png'},
    {type:'narrative', text:'Tájékoztatod hogy Sebastian a gyilkosság óta nincs sehol, és hogy a helyszínen talált nyomok alapján a cselédet megtámadták.'},
    {type:'narrative', text:'Akkor maga mit csinál itt? Miért nem a fiamat keresi?', image:'pictures/characters/baro.png', nextScene: 17},
    {type:'choices', prompt:'Mit kérdezel még?', image:'pictures/characters/baro.png', choices:[
        {id:'ask_charlotte', label:'Charlotte-ról kérdezel', nextScene: 18},
        {id:'ask_sebastian', label:'Sebastian-ról kérdezel', nextScene: 21},
        {id:'ask_kendo', label:'Kendőről kérdezel', nextScene: 24},
        {id:'end_talk', label:'Befejezed a beszélgetést', nextScene: 26}
    ]},
    {type:'narrative', text:'A cseléd felelt Sebastian fiam felügyeletéért, sok időt töltöttek együtt.', image:'pictures/characters/baro.png'},
    {type:'narrative', text:'Habár... az a boszorkány nő... az utóbbi napokban nem voltam vele megelégedve. Ha őszinte akarok lenni úgy viselkedett minden nap mintha másnaposság gyötörné, szédelgett, fáradt volt, elfelejtette a kiadott utasításokat.', image:'pictures/characters/baro.png'},
    {type:'narrative', text:'Bevallom éppen azon voltam, hogy elbocsátsam a birtokról és úgy cselédet vegyek fel a helyére. De tudja az elég sok papírmunkával jár.', image:'pictures/characters/baro.png', nextScene: 17},
    {type:'narrative', text:'Sebastian egy jó fiú, de néha meggondolatlanul cselekszik. Nemrégiben például érdekes cukorkákat találtam nála. Utána érdeklődtem és mind ismeretlen eredetű volt.', image:'pictures/characters/baro.png'},
    {type:'narrative', text:'Emellett meghallottam egy beszélgetését, mely arról szólt hogy új barátokat szerzett, de ezek nem előkelő családok gyermekeik.', image:'pictures/characters/baro.png'},
    {type:'narrative', text:'Ez is a cseléd hibája lehetett csak!', image:'pictures/characters/baro.png', nextScene: 17},
    {type:'narrative', text:'Megmutatod a bárónak a kendőt a báró címerével.'},
    {type:'narrative', text:'Ez hogy került hozzá? A cselédek nem kaphattak ilyen értékes tárgyakat. Akik birtokolhaták, azok a családtagok, a hintókocsisok, a keresk edőink és a lovászaink. Emellett még tolvaj is volt az a nő!', image:'pictures/characters/baro.png', nextScene: 17},
    {type:'narrative', text:'Detektív, találja meg minnél hamarabb a fiamat! Ne vesztegesse el az idejét egy jelentéktelen cseléd nyomozására!', image:'pictures/characters/baro.png', nextScene: 5, setState: {baronTalked: true}},
    {type:'narrative', text:'Odamész Thomas-hoz, aki idegesen vár rád az istálló mellett.'},
    {type:'narrative', text:'Detektív úr, miben segíthetek?', image:'pictures/characters/thomas.png'},
    {type:'choices', prompt:'Mit kérdezel Thomastól?', evidencePrompt: 'Nyomok kérdezése', image:'pictures/characters/thomas.png', choices:[
        {id:'thomas_charlotte', label:'Charlotte-ról kérdezel', nextScene: 31},
        {id:'thomas_sebastian', label:'Sebastian-ról kérdezel', nextScene: 34},
        {id:'thomas_end', label:'Befejezed a beszélgetést', nextScene: 5}
    ]},
    {type:'evidence_choices', prompt:'Melyik nyomról kérdezel?', image:'pictures/characters/thomas.png', choices:[
        {id:'kendo', label:'Kendő', nextScene: 37, requiresItem: 'Kendő'},
        {id:'kalapacs', label:'Kalapács', nextScene: 43, requiresItem: 'Kalapács'},
        {id:'gyumolcsok', label:'Gyümölcsök', nextScene: 47, requiresItem: 'Gyümölcsök'},
        {id:'back', label:'Vissza', nextScene: 29}
    ]},
    {type:'narrative', text:'Charlotte kisasszony nagyon kedves volt. Minden reggel köszönt nekem, amikor a lovakat etettem, és naponta többször is összefutottunk és mindig beszélgettünk kicsit.', image:'pictures/characters/thomas.png'},
    {type:'narrative', text:'Az utóbbi időben azonban furcsán viselkedett. Sokszor láttam, hogy szédült és fáradtnak tűnt.', image:'pictures/characters/thomas.png'},
    {type:'narrative', text:'Egyszer meg is kérdeztem, hogy jól van-e, de csak annyit mondott, hogy minden rendben.', image:'pictures/characters/thomas.png', nextScene: 29},
    {type:'narrative', text:'Sebastian fiatal úr gyakran eljött az istállóba. Szeretett a lovakkal lenni.', image:'pictures/characters/thomas.png'},
    {type:'narrative', text:'Charlotte kisasszony mindig vele volt. Felügyelete alá tartozott a fiatal úr.', image:'pictures/characters/thomas.png'},
    {type:'narrative', text:'Ma reggel is együtt indultak el a piacra. Azt mondták, vásárolni mennek.', image:'pictures/characters/thomas.png', nextScene: 29},
    {type:'narrative', text:'Újra megmutatod Thomasnak a kendőt.'},
    {type:'narrative', text:'Thomas szomorúan nézi.'},
    {type:'narrative', text:'Igen, ez a kendő eredetileg az enyém volt. Kérem a báró úrnak ne árulja el, de Charlotte és köztem több volt mint munkaviszony.', image:'pictures/characters/thomas.png'},
    {type:'narrative', text:'Teljesen titokba tartottuk, éjszakánként mentem át hozzá. Az igaz, hogy az utóbbi időkben valami megváltozott, de az indokát még nekem sem árulta el.', image:'pictures/characters/thomas.png'},
    {type:'narrative', text:'Volt olyan éjszaka, hogy megkért ne menjek át, és akkor láttam hogy kiszökött, de nem követtem. Másnap mikor rákérdeztem csak annyit árult el nekem hogy a Ghostskin-nel találkozott.', image:'pictures/characters/thomas.png'},
    {type:'narrative', text:'Abban tudok segíteni, hogy adok magának egy kulcsot. Ez a kulcs a kisasszony szobájához tartozik. Adott nekem egyet, hogy hangtalanul betudjak szökni hozzá.', image:'pictures/characters/thomas.png'},
    {type:'narrative', text:'Thomas nézi még egy pillanat erejéig a kendőt, aztán visszaadja és átadja a kulcsot.', addItem: 'Charlotte szobakulcsa', location: 'Charlotte szobája', nextScene: 29},
    {type:'narrative', text:'Megmutatod Thomasnak a kalapácsot.'},
    {type:'narrative', text:'Thomas megláttja a kalapácsot és hirtelen elsápad.', image:'pictures/characters/thomas.png'},
    {type:'narrative', text:'Thomas rosszul lesz, a falhoz támaszkodik és mélyen lélegzik.', image:'pictures/characters/thomas.png'},
    {type:'narrative', text:'Látva az állapotát gyorsan elrakod a kalapácsot.', nextScene: 5},
    {type:'narrative', text:'Megmutatod Thomasnak a gyümölcsöket.'},
    {type:'narrative', text:'Thomas figyelmesen megnézi őket.', image:'pictures/characters/thomas.png'},
    {type:'narrative', text:'Ha jól sejtem, ezt vette Charlotte kisasszóny a mai napon.', image:'pictures/characters/thomas.png', nextScene: 5},
    {type:'narrative', text:'Megmutatod Thomasnak a kalapácsot.'},
    {type:'narrative', text:'Thomas megláttja a kalapácsot és hirtelen elsápad.', image:'pictures/characters/thomas.png'},
    {type:'narrative', text:'Thomas rosszul lesz, a falhoz támaszkodik és mélyen lélegzik.', image:'pictures/characters/thomas.png'},
    {type:'narrative', text:'Látva az állapotát gyorsan elrakod a kalapácsot.', nextScene: 29},
    {type:'narrative', text:'Megmutatod Thomasnak a gyümölcsöket.'},
    {type:'narrative', text:'Thomas figyelmesen megnézi őket.', image:'pictures/characters/thomas.png'},
    {type:'narrative', text:'Ha jól sejtem, ezt vette Charlotte kisasszóny a mai napon.', image:'pictures/characters/thomas.png', nextScene: 29}

];

const barobirtokaBackground = 'pictures/barobirtoka.png';
