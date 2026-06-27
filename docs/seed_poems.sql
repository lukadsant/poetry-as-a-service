-- Auto-generated seed file to clear and replace poems
BEGIN;
TRUNCATE TABLE poems RESTART IDENTITY CASCADE;
TRUNCATE TABLE authors RESTART IDENTITY CASCADE;

-- Seeding Authors
INSERT INTO authors (id, name) VALUES (1, 'Tite Kubo');
INSERT INTO authors (id, name) VALUES (2, 'abarai renji');
INSERT INTO authors (id, name) VALUES (3, 'aizen sousuke');
INSERT INTO authors (id, name) VALUES (4, 'ayasegawa yumichika');
INSERT INTO authors (id, name) VALUES (5, 'ayon');
INSERT INTO authors (id, name) VALUES (6, 'barragan luisenbarn');
INSERT INTO authors (id, name) VALUES (7, 'cirucci sanderwicci');
INSERT INTO authors (id, name) VALUES (8, 'dordoni alessandro del socaccio');
INSERT INTO authors (id, name) VALUES (9, 'ginjou kuugo');
INSERT INTO authors (id, name) VALUES (10, 'grimmjow jaegerjaquez');
INSERT INTO authors (id, name) VALUES (11, 'hirako shinji');
INSERT INTO authors (id, name) VALUES (12, 'hisagi shuuhei');
INSERT INTO authors (id, name) VALUES (13, 'hitsugaya toushirou');
INSERT INTO authors (id, name) VALUES (14, 'hollow ichigo');
INSERT INTO authors (id, name) VALUES (15, 'ichimaru gin');
INSERT INTO authors (id, name) VALUES (16, 'inoue orihime');
INSERT INTO authors (id, name) VALUES (17, 'ishida uryuu');
INSERT INTO authors (id, name) VALUES (18, 'kira izuru');
INSERT INTO authors (id, name) VALUES (19, 'kuchiki byakuya');
INSERT INTO authors (id, name) VALUES (20, 'kuchiki rukia');
INSERT INTO authors (id, name) VALUES (21, 'kurosaki ichigo');
INSERT INTO authors (id, name) VALUES (22, 'kurotsuchi mayuri');
INSERT INTO authors (id, name) VALUES (23, 'luppi antenor');
INSERT INTO authors (id, name) VALUES (24, 'madarame ikkaku');
INSERT INTO authors (id, name) VALUES (25, 'matsumoto rangiku');
INSERT INTO authors (id, name) VALUES (26, 'nelliel tu odelschwanck');
INSERT INTO authors (id, name) VALUES (27, 'nnoitra gilga');
INSERT INTO authors (id, name) VALUES (28, 'sado yasutora');
INSERT INTO authors (id, name) VALUES (29, 'shiba ganjuu');
INSERT INTO authors (id, name) VALUES (30, 'shiba kaien');
INSERT INTO authors (id, name) VALUES (31, 'shiba kuukaku');
INSERT INTO authors (id, name) VALUES (32, 'shihouin yoruichi');
INSERT INTO authors (id, name) VALUES (33, 'soifon');
INSERT INTO authors (id, name) VALUES (34, 'szayel aporro granz');
INSERT INTO authors (id, name) VALUES (35, 'tia harribel');
INSERT INTO authors (id, name) VALUES (36, 'tousen kaname');
INSERT INTO authors (id, name) VALUES (37, 'ulquiorra cifer');
INSERT INTO authors (id, name) VALUES (38, 'urahara kisuke');
INSERT INTO authors (id, name) VALUES (39, 'yamada hanatarou');
INSERT INTO authors (id, name) VALUES (40, 'yamamoto genryuusai shigekuni');
INSERT INTO authors (id, name) VALUES (41, 'yammy llargo');
INSERT INTO authors (id, name) VALUES (42, 'zangetsu');
INSERT INTO authors (id, name) VALUES (43, 'zaraki kenpachi');

-- Seeding Poems
INSERT INTO poems (id, content, author_id, content_jp, content_ro, content_en, content_pt) VALUES (1, 'We fear
what does not exist.', 21, '我らは 姿無きが故に
それを畏れ', 'warera wa sugatanaki ga yue ni
sore o osore', 'We fear
what does not exist.', 'Nós somos gratos por
não termos forma.');
INSERT INTO poems (id, content, author_id, content_jp, content_ro, content_en, content_pt) VALUES (2, 'People can possess hope
because our eyes are unable to see death.', 20, '人が希望を持ちえるのは
死が目に見えぬものであるからだ', 'hito ga kibou o mochieru no wa
shi ga me ni mienu mono de aru kara da', 'People can possess hope
because our eyes are unable to see death.', 'As pessoas só conseguem manter a esperança
porque seus olhos são incapazes de enxergar a morte.');
INSERT INTO poems (id, content, author_id, content_jp, content_ro, content_en, content_pt) VALUES (3, 'If I were the rain
could I connect with someone''s heart
just as it can unite
the eternally separated earth and sky?', 16, 'もし わたしが雨だったなら
それが永遠に交わることのない
空と大地を繋ぎ留めるように
誰かの心を繋ぎ留めることができただろうか', 'moshi watashi ga ame datta nara
sore ga eien ni majiwaru koto no nai
sora to daichi o tsunagitomeru you ni
dareka no kokoro o tsunagi tomeru koto ga dekita darou ka', 'If I were the rain
could I connect with someone''s heart
just as it can unite
the eternally separated earth and sky?', 'Se eu fosse a chuva, poderia unir meu coração de um outro alguém?

Assim como ela une os eternamente distantes céu e terra?');
INSERT INTO poems (id, content, author_id, content_jp, content_ro, content_en, content_pt) VALUES (4, 'We attract each other
like a drop of water, like planets.
We repel each other
like magnets, like the colours of our skin.', 17, 'ぼくたちは ひかれあう
水滴のように 惑星のように
ぼくたちは 反発しあう
磁石のように 肌の色のように', 'boku-tachi wa hikare au
suiteki no you ni, wakusei no you ni
boku-tachi wa hanpatsu shiau
jishaku no you ni, hada no iro no you ni', 'We attract each other
like a drop of water, like planets.
We repel each other
like magnets, like the colours of our skin.', 'Quando nos encontramos, nos unimos,
como gotas d’água, como planetas.

Quando nos encontramos, nos repelimos,
como ímãs, como as cores da pele.');
INSERT INTO poems (id, content, author_id, content_jp, content_ro, content_en, content_pt) VALUES (5, 'If I don''t wield the sword, I can''t protect you.
If I keep wielding the sword, I can''t embrace you.', 28, '剣を握らなければ おまえを守れない
剣を握ったままでは おまえを抱き締められない', 'ken o nigirana kereba omae o mamorenai
ken o nigitta mama de wa omae o dakishimerarenai', 'If I don''t wield the sword, I can''t protect you.
If I keep wielding the sword, I can''t embrace you.', 'Se eu não empunhar a espada,
não posso te proteger.

Mas se eu empunhar a espada,
não posso te abraçar.');
INSERT INTO poems (id, content, author_id, content_jp, content_ro, content_en, content_pt) VALUES (6, 'True, we don''t have anything such as ''fate''.
It''s only those who drink in ignorance and fear
and stumble over their own feet
that fall and disappear within the muddy river
known as ''fate''.', 38, 'そう、 我々に運命などない
無知と恐怖にのまれ
足を踏み外したものたちだけが
運命と呼ばれる濁流の中へと
堕ちてゆくのだ', 'sou, ware-ware ni unmei nado nai
muchi to kyoufu ni nomare
ashi o fumihazushita mono-tachi dake ga
unmei to yobareru dakuryuu no naka he to
ochite yuku no da', 'True, we don''t have anything such as ''fate''.
It''s only those who drink in ignorance and fear
and stumble over their own feet
that fall and disappear within the muddy river
known as ''fate''.', 'Em verdade,
para nós não existe “destino”.
Somos aqueles que,
embebidos em medo e ignorância,
perdem o passo e caem no rio lamacento
que chamam de “destino”.');
INSERT INTO poems (id, content, author_id, content_jp, content_ro, content_en, content_pt) VALUES (7, 'We should not shed tears
for that will serve as a defeat of our bodies to our hearts.
It is then nothing more than proof
for it to be said that our hearts are things
beyond our ability to control.', 19, '我々は涙を流すべきではない
それは心に対する肉体の敗北であり
我々が心というものを
持て余す存在であるということの
証明にほかならないからだ', 'ware-ware wa namida o nagasu bekidewa nai
sore wa kokoro ni taisuru nikutai no haiboku de ari
ware-ware ga kokoro to iu mono o
moteamasu sonzai de aru to iu koto no
shoumei ni hokanaranai kara da', 'We should not shed tears
for that will serve as a defeat of our bodies to our hearts.
It is then nothing more than proof
for it to be said that our hearts are things
beyond our ability to control.', 'Nós não devemos derramar lágrimas pois,
para o coração, esta é a derrota do corpo carnal.
Não há prova mais contundente do que
nossas emoções estão alem de nosso controle.');
INSERT INTO poems (id, content, author_id, content_jp, content_ro, content_en, content_pt) VALUES (8, 'If it rusts, it can never be trusted.
If its owner fails to control it, it will cut him.
Yes, pride is
like a blade.', 42, '錆びつけば 二度と突き立てられず
摑み損なえば 我が身を裂く
そう 誇りとは
刃に似ている', 'sabitsukeba nido to tsukitaterarezu
tsukami sokonaeba wagami o saku
sou, hokori to wa
yaiba ni niteiru', 'If it rusts, it can never be trusted.
If its owner fails to control it, it will cut him.
Yes, pride is
like a blade.', 'Uma vez enferrujado, não consegue mais abrir caminho.
Uma vez sem controle, rasga a si próprio em pedaços.

Sim, o orgulho se parece
com uma espada.');
INSERT INTO poems (id, content, author_id, content_jp, content_ro, content_en, content_pt) VALUES (9, 'Ah, we all dream
that we are flying through the skies
with our eyes open.', 31, 'ああ おれたちは皆
眼をあけたまま
空を飛ぶ夢を見てるんだ', 'aa, ore-tachi wa mina
me o aketa mama
sora o tobu yume o miterun''da', 'Ah, we all dream
that we are flying through the skies
with our eyes open.', 'Sim, mesmo com olhos abertos
sonhamos voar através dos céus.');
INSERT INTO poems (id, content, author_id, content_jp, content_ro, content_en, content_pt) VALUES (10, 'We reach out our hand
to brush away the clouds and pierce the sky,
but even if we seize the moon and Mars
we still can''t reach the truth.', 29, '俺達は 手を伸ばす
雲を払い 空を貫き
月と火星は摑めても
真実には まだ届かない', 'ore-tachi wa te o nobasu
kumo o harai sora o tsuranuki
tsuki to kasei wa tsukamete mo
shinjitsu ni wa mada todokanai', 'We reach out our hand
to brush away the clouds and pierce the sky,
but even if we seize the moon and Mars
we still can''t reach the truth.', 'Esticamos as mãos,
atravessamos as nuvens e cruzamos o céu.
Contudo, mesmo que capturássemos a Lua ou Marte
ainda não alcançaríamos a verdade.');
INSERT INTO poems (id, content, author_id, content_jp, content_ro, content_en, content_pt) VALUES (11, 'I will light a fire on an unreachable fang,
so that I won''t have to see that star,
so that I won''t let it tear at my throat.', 2, '届かぬ牙に 火を灯す
あの星を見ずに済むように
この吭を裂いて しまわぬように', 'todokanu kiba ni hi o tomosu
ano hoshi o mizu ni sumu you ni
kono nodo o saite shimawanu you ni', 'I will light a fire on an unreachable fang,
so that I won''t have to see that star,
so that I won''t let it tear at my throat.', 'Incendeio minhas presas para alcançar o inatingível
para não ter que encarar aquela estrela
e não precisar rasgar minha garganta.');
INSERT INTO poems (id, content, author_id, content_jp, content_ro, content_en, content_pt) VALUES (12, 'We think the flower on the precipice is beautiful
because our fear make our feet stop at its edge
instead of stepping forward into the sky
like that flower.', 3, '我々が岩壁の花を美しく思うのは
我々が岩壁に足を止めてしまうからだ
悚れ無き その花のように
空へと踏み出せずにいるからだ', 'ware-ware ga ganpeki no hana o utsukushiku omou no wa
ware-ware ga ganpeki ni ashi o tometeshimau kara da
osore naki sono hana no you ni
sora he to fumidasezu iru kara da', 'We think the flower on the precipice is beautiful
because our fear make our feet stop at its edge
instead of stepping forward into the sky
like that flower.', 'Apreciamos a beleza de uma flor no penhasco
porque nossos pés param a beira do precipício
ao invés de, como aquela flor,
seguir em frente em direção aos céus.');
INSERT INTO poems (id, content, author_id, content_jp, content_ro, content_en, content_pt) VALUES (13, 'Any one time we throw away pride
we take a step closer to becoming beasts.
Any one time we kill an emotion
we take a step back from becoming beasts.', 43, '誇りを一つ捨てるたび
我らは獣に一歩近付く
心を一つ殺すたび
我らは獣から一歩遠退く', 'hokori o hitotsu suteru tabi
warera wa kemono ni ippo chikazuku
kokoro o hitotsu korosu tabi
warera wa kemono kara ippo toonoku', 'Any one time we throw away pride
we take a step closer to becoming beasts.
Any one time we kill an emotion
we take a step back from becoming beasts.', 'Sempre que nos desfazemos de nosso orgulho,
ficamos um passo mais perto de nos tornarmos feras.
Sempre que assassinamos um coração,
ficamos um passo distante de nos tornarmos feras.');
INSERT INTO poems (id, content, author_id, content_jp, content_ro, content_en, content_pt) VALUES (14, 'It creaks, it creaks; the tower of cleansed sins,
like the light, it will pass through this world.
It sways, it sways; the tower in our spine,
the one that will fall will be... us? Or the sky?', 39, '軋む軋む 浄罪の塔
光のごとくに 世界を貫く
揺れる揺れる 背骨の塔
堕ちてゆくのは ぼくらか 空か', 'kishimu kishimu, jouzai no tou
hikari no gotoku ni sekai o tsuranuku
yureru yureru, sebone no tou
ochite yuku no wa, bokura ka, sora ka', 'It creaks, it creaks; the tower of cleansed sins,
like the light, it will pass through this world.
It sways, it sways; the tower in our spine,
the one that will fall will be... us? Or the sky?', 'Rangendo, rangendo; a torre dos pecados purificados
como a luz, ela passará através deste mundo.
Balançando, balançando; a torre em nossa espinha.
Aqueles que cairão seremos nós? Ou o céu?');
INSERT INTO poems (id, content, author_id, content_jp, content_ro, content_en, content_pt) VALUES (15, 'I am merely practicing
saying goodbye to you.', 18, 'ぼくは ただ きみに
さよならを言う練習をする', 'boku wa tada kimi ni
sayonara o iu renshuu o suru', 'I am merely practicing
saying goodbye to you.', 'Permaneço somente na prática de meu adeus a ti.');
INSERT INTO poems (id, content, author_id, content_jp, content_ro, content_en, content_pt) VALUES (16, 'The constant shower of the sun''s manewill erase the remaining footprints on the thin ice.

Don''t be afraid to be deceivedfor the world is already full of deception.', 13, '降り頻る太陽の鬣が薄氷に残る足跡を消してゆく
欺かれるを恐れるな世界は既に欺きの上にある', 'furishikiru taiyou no tategami ga
azamukareru o osoreruna', 'The constant shower of the sun''s manewill erase the remaining footprints on the thin ice.

Don''t be afraid to be deceivedfor the world is already full of deception.', 'Os raios de sol que aos poucos banham a Terra
apagam as pegadas deixadas na fina camada de neve.
Não tema ser iludido, pois o mundo já está repleto de decepções.');
INSERT INTO poems (id, content, author_id, content_jp, content_ro, content_en, content_pt) VALUES (17, 'Red like blood.
White like bone.
Red like solitude.
White like silence.
Red like the beastly instinct.
White like a god''s heart.
Red like molten hatred.
White like chilling cries of pain.
Red like the shadows that feed on the night.
White shines and red scatters
like sighs that shoot through the moon.', 32, '血のように赤く
骨のように白く
孤独のように赤く
沈黙のように白く
獣の神経のように赤く
神の心臓のように白く
溶け出す憎悪のように赤く
凍てつく傷歎のように白く
夜を食む影のように赤く
月を射抜く吐息のように
白く輝き 赤く散る', 'chi no you ni akaku
hone no you ni shiroku
kodoku no you ni akaku
chinmoku no you ni shiroku
kemono no shinkei no you ni akaku
kami no shinzou no you ni shiroku
tokedasu zouo no you ni akaku
itetsuku shoutan no you ni shiroku
yoru o hamu kage no you ni akaku
tsuki o inuku toiki no you ni
shiroku kagayaki, akaku chiru', 'Red like blood.
White like bone.
Red like solitude.
White like silence.
Red like the beastly instinct.
White like a god''s heart.
Red like molten hatred.
White like chilling cries of pain.
Red like the shadows that feed on the night.
White shines and red scatters
like sighs that shoot through the moon.', 'Vermelho como o sangue,
branco como os ossos.
Vermelho como a solidão,
branco como o silêncio.
Vermelho como o instinto selvagem,
branco com o coração de Deus.
Vermelho como o ódio derretido,
branco como um gélido lamento de dor.
Vermelho como as sombras que devoram a noite,
como um suspiro que atravessa a Lua.
Brilha alvamente e dispersa-se em escarlate.');
INSERT INTO poems (id, content, author_id, content_jp, content_ro, content_en, content_pt) VALUES (18, 'Your shadow stealthily
leaves nothing of where you go, like a poisoned needle
that sews together my footsteps.

Your light pliantly
strikes the water tower, like a lightning bolt
that severs the source of my life.', 33, 'あなたの影は 密やかに
行くあての無い 毒針のように
私の歩みを縫いつける
あなたの光は しなやかに
給水搭を打つ 落雷のように
私の命の源を断つ', 'anata no kage wa hisoyaka ni
yuku ate no nai dokubari no you ni
watashi no ayumi o neitsukeru
anata no hikari wa shinayaka ni
sayuusuitou o utsu rakurai no you ni
watashi no inochi no minamoto o tatsu', 'Your shadow stealthily
leaves nothing of where you go, like a poisoned needle
that sews together my footsteps.

Your light pliantly
strikes the water tower, like a lightning bolt
that severs the source of my life.', 'Sua sombra, vagarosamente
como uma agulha errante envenenada
costura meus passos.

A sua luz, suavemente
como um trovão atinge a torre de água
corta a fonte da minha vida.');
INSERT INTO poems (id, content, author_id, content_jp, content_ro, content_en, content_pt) VALUES (19, 'That''s right, nothing else can change my world.', 21, 'そう、何ものも わたしの世界を変えられはしない', 'sou, nanimono mo watashi no sekai o kaerare wa shinai', 'That''s right, nothing else can change my world.', 'É verdade, nada mais
pode mudar o meu mundo.');
INSERT INTO poems (id, content, author_id, content_jp, content_ro, content_en, content_pt) VALUES (20, 'Those who do not know what love is
liken it to beauty.

Those who claim to know what love is
liken it to ugliness.', 15, '美しきを愛に譬ふのは
愛の姿を知らぬ者
醜きを愛に譬ふのは
愛を知ったと驕る者', 'utsukushiki o ai ni tatofu no wa
ai no sugata o shiranu mono
minikuki o ai ni tatofu no wa
ai o shitta to ogoru mono', 'Those who do not know what love is
liken it to beauty.

Those who claim to know what love is
liken it to ugliness.', 'Aqueles que não sabem o que é o amor
comparam-no a beleza.

Aquele que desejam saber o que é o amor
comparam-no a feiura.');
INSERT INTO poems (id, content, author_id, content_jp, content_ro, content_en, content_pt) VALUES (21, 'This entire world
exists for the sake of cornering you.', 11, 'この世のすべては
あなたを追いつめる為にある', 'kono yo no subete wa
anata o oitsumeru tameni aru', 'This entire world
exists for the sake of cornering you.', 'Este mundo inteiro existe
apenas para te encurralar.');
INSERT INTO poems (id, content, author_id, content_jp, content_ro, content_en, content_pt) VALUES (22, 'There is no meaning in our world,
neither is there any meaning in us, the ones who live in it.
It is then meaningless
for us, who are equally meaningless, to conceive the world in our thoughts
despite knowing there is no meaning to be found.', 37, '我等の世界に意味など無く
そこに生きる我等にも意味など無い
無意味な我等は世界を想
そこに意味は無いと知ることにすら
意味など無いというのに', 'warera no sekai ni imi nado naku
soko ni ikiru warera ni mo imi nado naku
muimina warera wa sekai o sou
soko ni imi wa nai to shiru koto ni sura
imi nado nai to iu no ni', 'There is no meaning in our world,
neither is there any meaning in us, the ones who live in it.
It is then meaningless
for us, who are equally meaningless, to conceive the world in our thoughts
despite knowing there is no meaning to be found.', 'Não há sentido em nosso mundo,
nem mesmo para nós, que vivemos nele.
Nós, seres sem sentido, pensamos sobre o mundo
e a percepção da falta de sentido nisso
não significa nada.');
INSERT INTO poems (id, content, author_id, content_jp, content_ro, content_en, content_pt) VALUES (23, 'We are the fish before the waterfall.
We are the insects inside the cage.

We are the wreckage of the angry sea,
the skull upon the staff,
the torrent of power, all of which the whale swallows.

We are the bull with five horns.
We are the monster that breathes fire.
The child who screams.

Ah, we are
being poisoned by the moonlight.', 24, '俺たちは滝の前の魚
俺たちは籠の中の虫
俺たちは波濤の残骸
髑髏の錫杖
力の奔流 それを飲む鯨
俺たちは五本角の雄牛
俺たちは火を吹く怪物
泣き叫ぶ子供
ああ 俺たちは
月光に毒されている', 'ore-tachi wa taki no mae no uo
ore-tachi wa kago no naka no mushi
ore-tachi wa hatou no zangai
dokuro no shakujou
chikara no honryuu sore o nomu kujira
ore-tachi wa gohontsuno no oushi
ore-tachi wa hi o fuku kaibutsu
naki sakebu kodomo
aa, ore-tachi wa
getsukou ni dokusareteiru', 'We are the fish before the waterfall.
We are the insects inside the cage.

We are the wreckage of the angry sea,
the skull upon the staff,
the torrent of power, all of which the whale swallows.

We are the bull with five horns.
We are the monster that breathes fire.
The child who screams.

Ah, we are
being poisoned by the moonlight.', 'Somos o peixe em frente a cachoeira,
o inseto preso na gaiola.
Somos as migalhas das ondas,
a caveira no bastão,
a força em torrente, a baleia que a engole.
Somos touro de cinco chifres,
o monstro que cospe fogo,
a criança que chora e esperneia.
Ah, estamos apenas envenenados pelo luar.');
INSERT INTO poems (id, content, author_id, content_jp, content_ro, content_en, content_pt) VALUES (24, 'Doesn''t matter who it is
I''ll fuckin'' break ''em.', 10, 'どいつもこいつも、
ぶっ壊れちまえ', 'doitsumo koitsumo,
bukkowarechimae', 'Doesn''t matter who it is
I''ll fuckin'' break ''em.', 'Fodam-se todos vocês.');
INSERT INTO poems (id, content, author_id, content_jp, content_ro, content_en, content_pt) VALUES (25, 'We all
die as we are born.
We always find the end
before the beginning.

If to live
means to continually search for wisdom,
we''ll find the end waiting after our last lesson.
To finally see the subtlety of the end
and understand it completely
is what it means to die.

We cannot help ourselves from growing wiser.
Those who are helpless to their search for knowledge
are those who cannot transcend death.', 14, '我々は皆
生まれながらにして死んでいる
終焉は常に
始まりの前から そこに在るのだ
生きることが
何かを知り続けることならば
我々が最後に知るものこそが終焉であり
終焉をついに見出し
完全に知ることこそが
即ち死なのだ
我々は何かを知ろうとしてはならない
死を超越できぬ者は
何ものも知ろうとしてはならないのだ', 'ware-ware wa minna
umarenagara ni shite shindeiru
shuuen wa tsune ni
hajimari no mae kara soko ni aru no da
ikiru koto ga
nanika o shiri tsudzukeru koto naraba
ware-ware ga saigo ni shiru mono koso ga shuuen de ari
shuuen o tsuini miidashi
kanzen ni shiru koto koso ga
sunawachi shi na no da
ware-ware wa nanika o shirou toshite wa naranai
shi o chouetsu dekinu mono wa
nanimono mo shirou toshite wa naranai no da', 'We all
die as we are born.
We always find the end
before the beginning.

If to live
means to continually search for wisdom,
we''ll find the end waiting after our last lesson.
To finally see the subtlety of the end
and understand it completely
is what it means to die.

We cannot help ourselves from growing wiser.
Those who are helpless to their search for knowledge
are those who cannot transcend death.', 'Todos já estamos mortos desde que nascemos.
O fim existe ali, desde muito antes do começo.

Se viver é um eterno saber
o fim é o último fato que conhecemos na vida.
Encontrar o fim e adquirir todo o seu conhecimento por completo:
Esta, sim, é a morte.

Não queiramos saber tudo.
Aquele que não tem a capacidade de sobrepujar a morte
não deve querer conhecer de tudo na vida.');
INSERT INTO poems (id, content, author_id, content_jp, content_ro, content_en, content_pt) VALUES (26, 'That voice that pierces my chest so deeply
resembles a never-ending cry of ecstacy.', 23, '私の胸に深く突き刺さるその声は
鳴り止まぬ歓声に似ている', 'watashi no mune ni fukaku tsukisasaru sono koe wa
nariyamanu kansei ni niteiru', 'That voice that pierces my chest so deeply
resembles a never-ending cry of ecstacy.', 'A voz que perfura profundamente meu peito
soa como uma ovação sem fim.');
INSERT INTO poems (id, content, author_id, content_jp, content_ro, content_en, content_pt) VALUES (27, 'We
As one:
are not intertwined.
As two:
do not share the same form.
Of the third:
we simply don''t have eyes.
Of the fourth:
we have no hope in that direction.
At the fifth
therein lies the heart.', 16, '私達
一つとして
混じりあうものはない
二つとして
同じ貌をしていない
三つ目の
瞳を持たぬばかりに
四つ目の
方角に希望はない
五つ目は
心臓の場所にある', 'watashi-tachi
hitotsu toshite
majiriau mono wa nai
futatsu toshite
onaji katachi o shitei nai
mitsutsu me no
hitomi o motanu bakari ni
yottsu me no
hougaku ni kibou wa nai
itsutsu me wa
shinzou no basho ni aru', 'We
As one:
are not intertwined.
As two:
do not share the same form.
Of the third:
we simply don''t have eyes.
Of the fourth:
we have no hope in that direction.
At the fifth
therein lies the heart.', 'Dentre nós
não há um ser que mescle ao outro;
não há dois de nós que tenham formas idênticas;
e, por não possuirmos o terceiro olho,
não enxergamos a esperança
em nenhuma das quatro direções;
mas o quinto caminho certamente existe,
Onde está nosso coração.');
INSERT INTO poems (id, content, author_id, content_jp, content_ro, content_en, content_pt) VALUES (28, 'Sire, we
look upon you
as one would a peacock.

A look that borders on
anticipation, adoration, and something
akin to neverending terror.', 8, '主よ、我々は
孔雀を見るような目つきで
あなたを見る
それは期待と、渇仰と
恐怖に似た底知れぬものに
縁取られているのだ', 'shu yo, ware-ware wa
kujaku o miru you na metsuki de
anata o miru
sore wa kitai to, katsugou to
kyoufu ni nita soko shirenu mono ni
fuchidorareteiru no da', 'Sire, we
look upon you
as one would a peacock.

A look that borders on
anticipation, adoration, and something
akin to neverending terror.', 'Ó, senhor
por vezes O olhamos
com olhos de quem enxerga um pavão.

Olhos ornados de algo imensurável
similar a esperança, adoração…
E pavor.');
INSERT INTO poems (id, content, author_id, content_jp, content_ro, content_en, content_pt) VALUES (29, 'In my desperation, I''ll dress myself up grandly
Even while knowing you''ll cut me down.

In my desperation, I''ll polish myself to a shine
Even while knowing you''ll cut me down.

It was terrible, how it was terrible
When you once did just that.

You lopped off my hair
And left me looking like you did when you died.', 7, 'ただ執拗に 飾り立てる
切り落とされると知りながら
ただ執拗に 磨き上げる
切り落とされると知りながら
恐ろしいのだ 恐ろしいのだ
切り落とされる その時が
切り落とされた その髪は
死んだあなたに 似てしまう', 'tada shitsuyou ni kazari tateru
kirioto sareru to shiri nagara
tada shitsuyou ni migaki ageru
kirioto sareru to shiri nagara
ozoroshii no da ozoroshii no da
kirioto sareru sono toki ga
kirioto sareta sono kami wa
shinda anata ni niteshimau', 'In my desperation, I''ll dress myself up grandly
Even while knowing you''ll cut me down.

In my desperation, I''ll polish myself to a shine
Even while knowing you''ll cut me down.

It was terrible, how it was terrible
When you once did just that.

You lopped off my hair
And left me looking like you did when you died.', 'Enfeito-os por puro capricho
mesmo sabendo que serão cortados.

Escovo-os como uma obcecada
mesmo sabendo que serão cortados.

Tenho medo, tenho medo
do momento de vê-los cair.

Pois esses cabelos espalhados
me lembram você morto.');
INSERT INTO poems (id, content, author_id, content_jp, content_ro, content_en, content_pt) VALUES (30, 'That wound is as deep as the ocean.
That bloody murder is as colorless as death.', 30, 'その疵深し、海淵の如し
その罪赤し、死して色無し', 'sono kizufukashi, kaien no gotoshi
sono tsumiakashi, shishite ironashi', 'That wound is as deep as the ocean.
That bloody murder is as colorless as death.', 'Esta ferida… é tão profunda com o oceano
este pecado ensanguentado… é tão incolor quanto a morte.');
INSERT INTO poems (id, content, author_id, content_jp, content_ro, content_en, content_pt) VALUES (31, 'Tell me I''m hated most in the world.', 34, '世界一嫌いだと言ってくれ', 'sekai ichi kirai da to itte kure', 'Tell me I''m hated most in the world.', 'Diga que me odeia mais do que tudo no mundo.');
INSERT INTO poems (id, content, author_id, content_jp, content_ro, content_en, content_pt) VALUES (32, 'The king is running.

Shaking free of his shadow
The armour rings
Kicking at the bones
Slurping at the flesh and blood
Raising up a combat
Crushing the heart.

Treading alone
Towards the distance.', 10, '王は駆ける
影を振り切り
鎧を鳴らし
骨を蹴散らし
血肉を啜り
軋みを上げる
心を潰し
独り踏み入る
遥か彼方へ', 'ou wa kakeru
kage o furikiri
yoroi o narashi
hone o kechirashi
chiniku o susuri
kishimi o ageru
kokoro o tsubushi
hitori fumi iru
haruka kanata e', 'The king is running.

Shaking free of his shadow
The armour rings
Kicking at the bones
Slurping at the flesh and blood
Raising up a combat
Crushing the heart.

Treading alone
Towards the distance.', 'O Rei corre.

Afugentando as sombras,
tilintando a armadura,
espalhando ossos,
sorvendo sangue e carne.
Ele ruge
encobrindo seu coração.

Sozinho, ele dá o passo
rumo ao horizonte longínquo.');
INSERT INTO poems (id, content, author_id, content_jp, content_ro, content_en, content_pt) VALUES (33, 'We are insects.

Swinging around with no nature
desiring evil, descending,
creeping like worms.

I lift my head up
even higher than the moon

until I can''t see
you bastards anymore.', 27, '俺達は虫
不揮発性の
悪意の下で
這い回る蠕虫
首をもたげる
月より高く
憐れなお前等が
見えなくなるまで', 'ore-tachi wa mushi
fukihatsusei no
akui no shita de
hai mawaru zenchuu
kubi o motageru
tsuki yori takaku
aware na omaera ga
mienaku naru made', 'We are insects.

Swinging around with no nature
desiring evil, descending,
creeping like worms.

I lift my head up
even higher than the moon

until I can''t see
you bastards anymore.', 'Nós somos insetos.

Vermes rastejando sob a constante maldade.

Eu ergo minha cabeça,
mais alto que a lua,

até não poder mais enxergar vocês,
seres dignos de pena.');
INSERT INTO poems (id, content, author_id, content_jp, content_ro, content_en, content_pt) VALUES (34, 'If you give me wings
I will soar for you

Even if this whole land
sinks into the water.

If you give me a sword
I will fight for you

Even if this whole sky
is shot through with your light.', 26, '私に翼をくれるなら
私はあなたのために飛ぼう
たとえば この 大地のすべてが
水に沈でしまうとしても
私に剣をくれるなら
私はあなたのために立ち向かおう
たとえばこの空のすべてが
あなたを光で射抜くとしても', 'watashi ni tsubasa o kureru nara
watashi wa anata no tame ni tobou
toteba kono daichi no subetega
mizu ni shizudeshimaushitemo
watashi ni tsurugi o kureru nara
watashi ni anata no tame ni tachi mukaou
tatoeba kono sora no subete ga
anata o hikari de inuku toshitemo', 'If you give me wings
I will soar for you

Even if this whole land
sinks into the water.

If you give me a sword
I will fight for you

Even if this whole sky
is shot through with your light.', 'Se me derem asas
eu voaria por você.

Mesmo que tudo nesta terra acabasse no fundo das águas.

Se me dessem uma espada
eu me levantaria por você.

Mesmo que tudo no céu, com suas luzes, viesse a alvejar você.');
INSERT INTO poems (id, content, author_id, content_jp, content_ro, content_en, content_pt) VALUES (35, 'If you even fail to be born,
it''s only natural to die.', 22, '産まれ堕ちるば
死んだも同然', 'umare ochireba
shinda mo douzen', 'If you even fail to be born,
it''s only natural to die.', 'Ser parido no mundo
é praticamente como morrer.');
INSERT INTO poems (id, content, author_id, content_jp, content_ro, content_en, content_pt) VALUES (36, 'It''s still too early to believe.', 11, '信じるのは まだ早い', 'shinjiru no wa mada hayai', 'It''s still too early to believe.', 'Ainda é cedo para acreditar.');
INSERT INTO poems (id, content, author_id, content_jp, content_ro, content_en, content_pt) VALUES (37, 'People cannot be thought to define beauty
however flowers can be thought to define beauty

A person''s form resembles a flower
only at the time of defeat, when it is torn to pieces.', 4, '人を美しいとは思わないけれど
花を美しいとは思う
人の姿が花に似るのは
ただ斬り裏裂かれて倒れる時だ', 'hito o utsukushiito wa omowanai keredo
hana o utsukushiito wa omou
hito no sugata ga hana no niruno wa
tada kirisakarete taoreru toki da', 'People cannot be thought to define beauty
however flowers can be thought to define beauty

A person''s form resembles a flower
only at the time of defeat, when it is torn to pieces.', 'Não acho as pessoas belas
como acho que as flores são.

Pessoas são parecidas com flores
só quando caem mutiladas no chão.');
INSERT INTO poems (id, content, author_id, content_jp, content_ro, content_en, content_pt) VALUES (38, 'The only true fear
is to become a warrior that does not know fear.', 12, '恐れることは ただひとつ
恐れを知らぬ 戦士と為ること', 'osoreru koto wa tada hitotsu
osore o shiranu senshi to naru koto', 'The only true fear
is to become a warrior that does not know fear.', 'Se há algo que temo
é me tornar um guerreiro sem temores.');
INSERT INTO poems (id, content, author_id, content_jp, content_ro, content_en, content_pt) VALUES (39, 'To err is human.
To kill is the devil.', 5, '過つは、 人
殺すは、 魔', 'ayamatsu wa hito
korosu wa oni', 'To err is human.
To kill is the devil.', 'Humanos erros.
Demônios matam.');
INSERT INTO poems (id, content, author_id, content_jp, content_ro, content_en, content_pt) VALUES (40, 'I envy because of the heart
I glutton because of the heart
I covet because of the heart
I am prideful because of the heart
I sloth because of the heart
I rage because of the heart
Because of the heart
I lust for everything about you.', 37, '心在るが故に妬み
心在るが故に喰らい
心在るが故に奪い
心在るが故に傲り
心在るが故に惰り
心在るが故に怒り
心在るが故に
お前のすべてを欲する', 'kokoro aru ga yue ni netami
kokoro aru ga yue ni kurai
kokoro aru ga yue ni ubai
kokoro aru ga yue ni ogori
kokoro aru ga yue ni anatori
kokoro aru ga yue ni ikari
kokoro aru ga yue ni
omae no subete o hotsu suru', 'I envy because of the heart
I glutton because of the heart
I covet because of the heart
I am prideful because of the heart
I sloth because of the heart
I rage because of the heart
Because of the heart
I lust for everything about you.', 'Por ter um coração, invejo.
Por ter um coração, devoro.
Por ter um coração, tomo.
Por ter um coração, desprezo.
Por ter um coração, vadio.
Por ter um coração, enfureço.
Por ter um coração, desejo tudo o que há em você.');
INSERT INTO poems (id, content, author_id, content_jp, content_ro, content_en, content_pt) VALUES (41, 'To plunder
that which has been lost,
blood and flesh and bone
and something else.', 41, '失くしたものを
奪い取る
血と肉と骨と
あとひとつ', 'nakushita mono o
ubai toru
chi to niku to hone to
ato hitotsu', 'To plunder
that which has been lost,
blood and flesh and bone
and something else.', 'Corro para obter
tudo aquilo que perdi.
Sangue, carne, ossos
e algo mais.');
INSERT INTO poems (id, content, author_id, content_jp, content_ro, content_en, content_pt) VALUES (42, 'There is no world without sacrifice.
Are you unaware?
We are
in a sea of blood, ashes floating in hell
crying the name
a fading world.', 35, '犠牲無き世界なと ありはしない
気付かないのか
我々は
血の海に灰を浮かべた地獄の名を
仮に世界と
呼んでいるのだ', 'gisei naki sekai na to ari wa shinai
kizukanai no ka
wareware wa
chi no umi ni hai o ukabeta jihoku no na o
kari ni sekai to
yondeiru no da', 'There is no world without sacrifice.
Are you unaware?
We are
in a sea of blood, ashes floating in hell
crying the name
a fading world.', 'Não existe mundo isento de sacrifícios.
Ainda não percebeu?
Um inferno de cinzas jogas sobre um mar de sangue.
É a isso que damos o nome,
supostamente,
de mundo.');
INSERT INTO poems (id, content, author_id, content_jp, content_ro, content_en, content_pt) VALUES (43, 'To decay is our companion.
As night is our servant,
as the crow pecks at this body,
I await you at the castle of elm trees.', 6, '腐敗は我が友
夜は我が僕
鴉にこの身を啄ませながら
楡の館でお前を待つ', 'fuhai wa waga tomo
yo wa waga shimobe
karasu ni kono mi o tsuiba mase nagara
nire no yakata de omae o matsu', 'To decay is our companion.
As night is our servant,
as the crow pecks at this body,
I await you at the castle of elm trees.', 'A putrefação é minha amiga.
A noite, minha serva.
Deixo corvos bicarem meu corpo
enquanto espero por ti em minha mansão de olmo.');
INSERT INTO poems (id, content, author_id, content_jp, content_ro, content_en, content_pt) VALUES (44, 'Man has, above all else, evil.
That I would, for the sake of having this illusion of justice
beyond everything that is I, more than the evil that I have, hallucinate, that there is nothing elsethe justice that I believed in has its own evil.
Justice, for the sake of obtaining justice isconstantly, endlessly doubting my own justice.', 36, '人は皆すべからく空くであり
自らを正義であると錯覚する為には
己以外の何者かを 上の悪であると
錯覚するより 他に無いのだ', 'hito wa mina subekaraku aku deari
mizukara o seigi de aru to sakkaku suru tame ni wa
onoreigai no nanimono ka o onoreijou no aku de aru to
sakkaku suru yori hoka ni nai no da', 'Man has, above all else, evil.
That I would, for the sake of having this illusion of justice
beyond everything that is I, more than the evil that I have, hallucinate, that there is nothing elsethe justice that I believed in has its own evil.
Justice, for the sake of obtaining justice isconstantly, endlessly doubting my own justice.', 'O ser humano é mau em sua essência.
Por isso, para se sentir justo, não conhece outra maneira
senão interpretar no outro um mal maior do que o seu.');
INSERT INTO poems (id, content, author_id, content_jp, content_ro, content_en, content_pt) VALUES (45, 'You may live bowing on your knees,
but die standing on your feet.', 40, '伏して生きるな、
立ちて死すべし', 'fushite ikiru na
tachite shisubeshi', 'You may live bowing on your knees,
but die standing on your feet.', 'A viver curvado,
escolha morrer erguido.');
INSERT INTO poems (id, content, author_id, content_jp, content_ro, content_en, content_pt) VALUES (46, 'To know sorrow
is not terrifying.
What is terrifying
is to know you can''t go back
to happiness you could have.', 25, '不幸を知ることは
怖ろしくはない
怖ろしいのは
過ぎ去った幸福が
戻らぬと知ること', 'fukou o shiru koto wa
osoroshiku wa nai
osoroshii no wa
sugisatta koufuku ga
modoranuto shiru koto', 'To know sorrow
is not terrifying.
What is terrifying
is to know you can''t go back
to happiness you could have.', 'Não temo conhecer a infelicidade.
O que temo é saber que a felicidade que se foi
jamais voltará.');
INSERT INTO poems (id, content, author_id, content_jp, content_ro, content_en, content_pt) VALUES (47, 'You are becoming a snake tomorrow,
and as you start to devour people
with that mouth that has devoured others
you cry your love to me
and the same as today, I do wonder
will I be able to say my love to you?', 15, '君が明日 蛇となり
人を喰らい 始めるとして
人を喰らった その口で
僕を愛すと 咆えたとして
僕は果たして 今日と同じ
君を愛すと 言えるだろうか', 'kimi ga ashita hebi tonari
hito o kurai hajimeru toshite
hito o kuratta sono kuchi de
boku o aisuto hoetatoshite
boku wa hatashite kyou to onaji ni
kimi o ai suto ieru darou ka', 'You are becoming a snake tomorrow,
and as you start to devour people
with that mouth that has devoured others
you cry your love to me
and the same as today, I do wonder
will I be able to say my love to you?', 'Se amanhã tu te tornasses serpente
e começasses a devorar gente.
Se ainda engolindo a carne
uivasses amor por mim.
Será que eu ainda seria capaz
de confessar igual amor ao que sinto hoje por ti?');
INSERT INTO poems (id, content, author_id, content_jp, content_ro, content_en, content_pt) VALUES (48, 'All people, imitations of apes.
All gods, imitations of people.', 3, '人は皆、猿のまがいもの
神は皆、人のまがいもの', 'hito wa mina saru no magaimono
kami wa mina, hito no magaimono', 'All people, imitations of apes.
All gods, imitations of people.', 'Pessoas não passam de primatas corrompidos,
assim como Deus não passa de uma pessoa corrompida.');
INSERT INTO poems (id, content, author_id, content_jp, content_ro, content_en, content_pt) VALUES (49, 'I wonder, can I keep up with it?
The speed of the world without you in it.', 21, '僕はついてゆけるだろうか
君のいない世界のスピードに', 'boku wa tsuite yukeru darou ka
kimi no inai sekai no supiido ni', 'I wonder, can I keep up with it?
The speed of the world without you in it.', 'Como faço para me acostumar
a fugacidade desse mundo sem você?');
INSERT INTO poems (id, content, author_id, content_jp, content_ro, content_en, content_pt) VALUES (50, 'Time usually encroaches from behind
Raising a howl as it flows and ebbs away

Give up
As time seems to wash away your exquisite past
And tears away your fangs

Do not look forward
Your hope encroaches from behind
There is nothing but darkness in the muddy stream.', 9, '時は常に背後から迫り
唸りを上げて眼前に流れ去る
踏み止まれ
時がお前を美しい過去へと押し流そうと
どれほど牙を剥こうとも
前を見るな
お前の希望は背後に迫る
冥冥たる濁流の中にしか無い', 'toki wa tsune ni haigo kara semari
unari o agete ganzen ni nagare saru
fumi todomare
toki ga omae o utsukushii kako e to oshi nagasouto
dore hodo kiba o mukou tomo
mae o miru na
omae no kibou wa haigo no semaru
meimei taru dakuryuu no naka ni shikanai', 'Time usually encroaches from behind
Raising a howl as it flows and ebbs away

Give up
As time seems to wash away your exquisite past
And tears away your fangs

Do not look forward
Your hope encroaches from behind
There is nothing but darkness in the muddy stream.', 'O tempo sempre nos surpreende pelas costas
e passa por nós, num rugir, quebrando como as ondas.

Pare onde está.
Por mais que o tempo lhe revele suas presas
tentando raptá-lo em sua correnteza, para o mais belo dos passados.

Não olhe para frente.
Pois sua esperança está no turbilhão escuro e caótico
que circula atrás de você.');
INSERT INTO poems (id, content, author_id, content_jp, content_ro, content_en, content_pt) VALUES (51, 'Não meta o dedo
no meu coração.', 1, NULL, NULL, NULL, 'Não meta o dedo
no meu coração.');
INSERT INTO poems (id, content, author_id, content_jp, content_ro, content_en, content_pt) VALUES (52, 'Vem contar comigo
as marcas de mordida
que deixei em você.', 1, NULL, NULL, NULL, 'Vem contar comigo
as marcas de mordida
que deixei em você.');
INSERT INTO poems (id, content, author_id, content_jp, content_ro, content_en, content_pt) VALUES (53, 'O fato de eu ser tão jovem
e tão imaturo
parece ser imperdoável pra esses adultos
que se gabam da incontestável perfeição
de sua decrepitude.', 1, NULL, NULL, NULL, 'O fato de eu ser tão jovem
e tão imaturo
parece ser imperdoável pra esses adultos
que se gabam da incontestável perfeição
de sua decrepitude.');
INSERT INTO poems (id, content, author_id, content_jp, content_ro, content_en, content_pt) VALUES (54, 'Se podes dizer que teu coração é integro
só isso já configura tua força.', 1, NULL, NULL, NULL, 'Se podes dizer que teu coração é integro
só isso já configura tua força.');
INSERT INTO poems (id, content, author_id, content_jp, content_ro, content_en, content_pt) VALUES (55, 'Dê 1 passo adiante
e em 2 segundos não haverá mais volta
rumo aos 3 Mil Mundos de um mar de sangue.', 1, NULL, NULL, NULL, 'Dê 1 passo adiante
e em 2 segundos não haverá mais volta
rumo aos 3 Mil Mundos de um mar de sangue.');
INSERT INTO poems (id, content, author_id, content_jp, content_ro, content_en, content_pt) VALUES (56, 'Batalhão marcha, marchando, a trombeta vai soar.
O zumbido ao ouvido, como estrela a tilintar.
As botas na cadência, como trovão a rufar.', 1, NULL, NULL, NULL, 'Batalhão marcha, marchando, a trombeta vai soar.
O zumbido ao ouvido, como estrela a tilintar.
As botas na cadência, como trovão a rufar.');
INSERT INTO poems (id, content, author_id, content_jp, content_ro, content_en, content_pt) VALUES (57, 'Embora se despedace em pétalas, para nunca mais desabrochar,
que ao menos se irrompa em chamas, pela beleza do rebentar.', 1, NULL, NULL, NULL, 'Embora se despedace em pétalas, para nunca mais desabrochar,
que ao menos se irrompa em chamas, pela beleza do rebentar.');
INSERT INTO poems (id, content, author_id, content_jp, content_ro, content_en, content_pt) VALUES (58, 'A alma se ergue como labaredas;
apesar da chuva.', 1, NULL, NULL, NULL, 'A alma se ergue como labaredas;
apesar da chuva.');
INSERT INTO poems (id, content, author_id, content_jp, content_ro, content_en, content_pt) VALUES (59, 'Lutar é tudo.', 1, NULL, NULL, NULL, 'Lutar é tudo.');
INSERT INTO poems (id, content, author_id, content_jp, content_ro, content_en, content_pt) VALUES (60, 'Em tua inocência, pareces o sol.
Em pecado também, pareces o sol.', 1, NULL, NULL, NULL, 'Em tua inocência, pareces o sol.
Em pecado também, pareces o sol.');
INSERT INTO poems (id, content, author_id, content_jp, content_ro, content_en, content_pt) VALUES (61, 'Se eu acreditasse que o mundo é repleto de perigos
e o meu desejo é de te proteger de todos eles…
É porque tenho dentro de mim um ímpeto
tão fatal quanto esses perigos.', 1, NULL, NULL, NULL, 'Se eu acreditasse que o mundo é repleto de perigos
e o meu desejo é de te proteger de todos eles…
É porque tenho dentro de mim um ímpeto
tão fatal quanto esses perigos.');
INSERT INTO poems (id, content, author_id, content_jp, content_ro, content_en, content_pt) VALUES (62, 'Eu vou continuar
a desafiar minha vida
enquanto meu coração
tiver presas.', 1, NULL, NULL, NULL, 'Eu vou continuar
a desafiar minha vida
enquanto meu coração
tiver presas.');
INSERT INTO poems (id, content, author_id, content_jp, content_ro, content_en, content_pt) VALUES (63, 'Para viver e para ser mantido vivo
a diferença é inexistente.

Para morrer e ser morto
a diferença é igualmente inexistente.', 1, NULL, NULL, NULL, 'Para viver e para ser mantido vivo
a diferença é inexistente.

Para morrer e ser morto
a diferença é igualmente inexistente.');
INSERT INTO poems (id, content, author_id, content_jp, content_ro, content_en, content_pt) VALUES (64, 'Não existe nada,
e é isso que é a beleza.', 1, NULL, NULL, NULL, 'Não existe nada,
e é isso que é a beleza.');
INSERT INTO poems (id, content, author_id, content_jp, content_ro, content_en, content_pt) VALUES (65, 'Eu te amo até a morte.', 1, NULL, NULL, NULL, 'Eu te amo até a morte.');
INSERT INTO poems (id, content, author_id, content_jp, content_ro, content_en, content_pt) VALUES (66, 'Apenas cortar
é tudo o que há nesta vida?', 1, NULL, NULL, NULL, 'Apenas cortar
é tudo o que há nesta vida?');
INSERT INTO poems (id, content, author_id, content_jp, content_ro, content_en, content_pt) VALUES (67, 'A coisa tá preta
De ponta-cabeça.', 1, NULL, NULL, NULL, 'A coisa tá preta
De ponta-cabeça.');
INSERT INTO poems (id, content, author_id, content_jp, content_ro, content_en, content_pt) VALUES (68, 'Não é estonteante
De tão intoxicante?', 1, NULL, NULL, NULL, 'Não é estonteante
De tão intoxicante?');
INSERT INTO poems (id, content, author_id, content_jp, content_ro, content_en, content_pt) VALUES (69, 'Balas, garras, estandarte e espada,
Conto nos cinco dedos da mão
O momento de te reencontrar.', 1, NULL, NULL, NULL, 'Balas, garras, estandarte e espada,
Conto nos cinco dedos da mão
O momento de te reencontrar.');
INSERT INTO poems (id, content, author_id, content_jp, content_ro, content_en, content_pt) VALUES (70, 'Não há dor
Neste balanço,
Exceto naquilo que concerne aos nossos olhos.', 1, NULL, NULL, NULL, 'Não há dor
Neste balanço,
Exceto naquilo que concerne aos nossos olhos.');
INSERT INTO poems (id, content, author_id, content_jp, content_ro, content_en, content_pt) VALUES (71, 'A mão preciosa de minha criança? Sua mão errante,
Vagando e procurando por mim,
Agarra numa mão que se afasta quando ela se aproxima.
O fim do caso que está puxando-a para seguir este caminho.', 1, NULL, NULL, NULL, 'A mão preciosa de minha criança? Sua mão errante,
Vagando e procurando por mim,
Agarra numa mão que se afasta quando ela se aproxima.
O fim do caso que está puxando-a para seguir este caminho.');
INSERT INTO poems (id, content, author_id, content_jp, content_ro, content_en, content_pt) VALUES (72, 'Se minhas palavras tomassem forma,
Seria como se meu fracasso chegasse até você, parado na escuridão.', 1, NULL, NULL, NULL, 'Se minhas palavras tomassem forma,
Seria como se meu fracasso chegasse até você, parado na escuridão.');

-- Synchronize auto-increment sequences
SELECT setval('authors_id_seq', (SELECT MAX(id) FROM authors));
SELECT setval('poems_id_seq', (SELECT MAX(id) FROM poems));
COMMIT;