export type HeavenSpacePassage = {
  id: number;
  name: string;
  content: string;
};

export const HEAVEN_SPACE_PASSAGES: HeavenSpacePassage[] = [
  {
    id: 1,
    name: " Memory 5",
    content:
      "(set: $memory = $memory + 1)You remembered the structure of this building so well. It was your school, where you spent years studying all those useless subjects, well, except for one. Arts and Music had always attracted you, there was something about the artistic display and the meanings behind all those paintings you saw at the museums you went to sometimes that got your attention. Your classmates eventually introduced you to their Music Club, which you joined out of curiosity.\n\nYou received a guitar on your 14th birthday. You started practicing the tunes to the songs you had always adored from your favorite musicians. Your mother would always watch you play the notes, adjust the tabs, write out note sheets, and even record them and post them on social media. She joked about wanting her child to write her a song one day.\n\nYou never tried composing a song ever, since there was never a melody that came to mind that felt unique to you, your brand name, your soul. Until the lightbulb appeared. You spent all night thinking of ways to make the song flow naturally, even retaking all the vocal clips were they to have even the slightest bits of cracking. You placed the music sheets onto your shelf, naming them after your mother. You wish you had finished it.\n\n[[Come back to reality.|Afterwards 4]]",
  },
  {
    id: 2,
    name: '"..."',
    content:
      '"Hmm? Not the talkative one I assume? Regardless, I\'ll inform you of your current whereabouts and the situation you\'re in right now." The figure kneeled by your side, his hands resting on both of your shoulders. He made sure you paid attention since it was unusual for a soul to be quiet.\n\n"As of right now, you have just \'\'died\'\'. Passed away from your current lifetime. Right now, you\'re currently in Heaven Space, a space for the soul to rest for the time being until they have to enter the gates of rebirth."\n\n[["Who are you then?"|"Well... that didn\'t exactly answer my question."]]\n[["What do you mean I died?"]]',
  },
  {
    id: 3,
    name: '"Hmm..."',
    content: "[[Sleep.]]\n[[Hang with the Reaper.]]\n[[Start provoking him.]]",
  },
  {
    id: 4,
    name: '"How long have I been unconscious for...?"',
    content:
      '"Well... quite frankly the entire day. It\'s still raining, however, since your heart is not in its best state." The Reaper glanced up into the sky, the huge tree was enough to cover them from the downpour.\n\n"It\'s okay to let out your feelings. There is no judgment in Heaven Space. As long as you feel comfortable here, this space will be your home. And I\'ll be a part of it too if it makes your sleep a bit better tonight. Sleep well." The Reaper hummed a familiar melody, which drove you to sleep shortly after.\n\nSomething was calming about it all - the sounds of the droplets hitting the plains of dirt, the lingering smell of nature as they hit the earthy floor; the cloudy fog embedding the sea of air; the sight of pigeons and doves flying across the sky to seek shelter. It made your sleep all the more peaceful.\n\n[[Sleep. |DAY 3]]',
  },
  {
    id: 5,
    name: '"Nice to meet you."',
    content:
      '"Nice to meet you too." The Reaper gave you a small little bow. After all, treating a soul with the utmost respect is basic hospitality for a Grim Reaper. \n\n"Now, let me explain what\'s going on. In Heaven Space, you have 3 days until reincarnation. On your final day, you will step into the boat, and you will enter the Light, then you\'ll be reborn. Until then," he held your cold hand, "I\'ll keep you company. Is that a promise?" \n\n[["Yes."|Say nothing.]]\n[["No."|Say nothing.]]',
  },
  {
    id: 6,
    name: '"No, it doesn\'t scare me."',
    content:
      "His eyes widened at your response. \"Fearless, I assume? Very admirable.\" He placed his scythe down. Not that he was surprised, just a bit thrown off that a soul wouldn't be scared.\n\n\"Now then, since you decided to tease me, that kind of ruined my mood. But that's okay, because we're merely just strangers at this stage, so it's natural to feel weird about it, even as a Reaper. We can settle with finding your memories tomorrow. Is that clear?\" The Reaper placed his hood back on and glanced at you. It made you uneasy for some weird reason.\n\n[[Memory Unlocked.|Memory 2]]",
  },
  {
    id: 7,
    name: '"No, you just didn\'t fit the archetype of a normal Reaper."',
    content:
      '"//Reapers have a stereotype now?!// That is something only humans could ever think of, how ridiculous." An annoyed expression painted itself across the Reaper\'s face. Of course, he needs to keep himself composed, you were only a new soul, after all.\n\n"Anyways, do you want to do anything? This space has endless possibilities, just that you can\'t go on social media. Internet doesn\'t exist here."\n\n[["Hmm..."]]\n[["What?! That\'s so lame!"]]',
  },
  {
    id: 8,
    name: '"Wait...As in, the Grim Reaper?!"',
    content:
      '"Yes, yes, it sounds seriously unbelievable, but please trust me. Well, I mean, I am shadowy, I have a scythe, I have scars, what else is there to call me?" The Reaper did a little twirl to prove his point. \n\n[["No, you just didn\'t fit the archetype of a normal Reaper."]]',
  },
  {
    id: 9,
    name: '"Well... that didn\'t exactly answer my question."',
    content:
      'The figure stood silent for a little, before reassessing himself.\n\n"I am\'\' the Reaper\'\'. Every dead soul is assigned a Reaper to keep them accompanied in Heaven Space. Whether or not you want to be friends or foes with me is entirely up to your decision." He spoke as he unveils his hood, showing his characteristics. \n\nThe Reaper had a human face, with a prominent scar across his face. His scleras were dark, and his irises were white. His hair was like a Siamese cat\'s hair color, black and white in some areas. \n\n"Does that answer your question?"\n\n\n[["Wait...As in, the Grim Reaper?!"]]\n[["You\'re surprisingly attractive."]] \n[["Yes, it does, thank you."]]\n[["Nice to meet you."]]',
  },
  {
    id: 10,
    name: '"Were you always a musician?"',
    content:
      '(if:$annoyed >= 3)[The Reaper noticed you and kept his hands playing while he turned his head to look at you. Impressive. "Well... I do remember learning piano lessons when I was once human. My ancestors, from what I heard of my own record, are musicians. They excel in any kind of instrument of their choice. Since nobody played piano, I took it up. It\'s a beautiful instrument." The notes of the piano flowed away into the clouds as he kept on.\n\n"I would invite you to a duet, but considering how you have been annoying me for the past few days now, I don\'t think I\'m up for it. But if you want to, I guess I will give you the benefit of the doubt." He kept his attention on the keys. "What will it be?"](else-if:$annoyed < 3)[The Reaper noticed you and kept his hands playing while he turned his head to look at you. Impressive. "Well... I do remember learning piano lessons when I was once human. My ancestors, from what I heard of my own record, are musicians. They excel in any kind of instrument of their choice. Since nobody played piano, I took it up. It\'s a beautiful instrument." The notes of the piano flowed away into the clouds as he kept on.\n\n"If you wish, you may vocalize with me. We can be a duet, a performance for our audience of two people, just you and me, together." The Reaper flashed a smile as a chord played. "What will it be?"]\n\n[[Sing along with him.]]\n[["...Well I\'d rather just listen to you play."]]',
  },
  {
    id: 11,
    name: '"What do you mean I died?"',
    content:
      '"You had just passed away. The reasons are due to... well, that is classified information that you could find yourself within this space, only if you wish to." The figure let out a little giggle as he stood up. "Heaven Space is meant for you to find comfort, or come to terms with your past lifetime before you move on, after all.\n\n[[Oh... Well, who are you then?|"Well... that didn\'t exactly answer my question."]]',
  },
  {
    id: 12,
    name: '"What?! That\'s so lame!"',
    content:
      '"Hey. That\'s the rule. You are allowed to play offline games if you wish to allow Heaven Space to give you a game console, or a phone. But... well... for obvious reasons, we aren\'t going to do that. That\'s going to break the laws of the universe." A cheeky smirk plastered across The Reaper\'s face, but he was telling the truth after all.\n\n"Back to what I just said, what do you want to do?"\n\n[["Hmm..."]]',
  },
  {
    id: 13,
    name: '"Where am I?"',
    content:
      '"If you can trust me with this, I can explain it to you." The figure kneeled by your side, his hands resting on both of your shoulders. \n\n"As of right now, you have just \'\'died\'\'. Passed away from your current lifetime. Right now, you\'re currently in Heaven Space, a space for the soul to rest for the time being until they have to enter the gates of rebirth."\n\n[["I see... And who are you exactly?"|"Well... that didn\'t exactly answer my question."]]\n[["What do you mean I died?"]]',
  },
  {
    id: 14,
    name: '"Who are you?!"',
    content:
      '"Ah, please don\'t be so alarmed. Please breathe and calm down, I can explain it to you." The figure kneeled by your side, his hands resting on both of your shoulders. \n\n"As of right now, you have just \'\'died\'\'. Passed away from your current lifetime. Right now, you\'re currently in Heaven Space, a space for the soul to rest for the time being until they have to enter the gates of rebirth."\n\n[["Well... that didn\'t exactly answer my question."]]\n[["What do you mean I died?"]]',
  },
  {
    id: 15,
    name: '"Yes, it does scare me."',
    content:
      'He let out a cheeky smirk for a second before going back to his deadpan expression. "Just as I thought." He placed his scythe down. He expected the expected and was satisfied.\n\n"Now then, since you decided to tease me, that kind of ruined my mood. But that\'s okay, because we\'re merely just strangers at this stage, so it\'s natural to feel weird about it, even as a Reaper. We can settle with finding your memories tomorrow. Is that clear?" The Reaper placed his hood back on and glanced at you. It made you uneasy for some weird reason.\n\n[[Memory Unlocked.|Memory 2]]',
  },
  {
    id: 16,
    name: '"Yes, it does, thank you."',
    content:
      '"I\'m glad you understood, barely any souls were easy to understand this, they panicked and called me a ghost, haha." He joked a little, and his grip on his scythe loosened a little. \n\n"Anyways... in Heaven Space, you have 3 days until reincarnation. On your final day, you will step into the boat, and you will enter the Light, then you\'ll be reborn. I will keep you accompanied by then." His gaze was back to that of a cold, unloving one. \n\n[[That\'s a bit short...]]',
  },
  {
    id: 17,
    name: '"You can stop treating me like a child now."',
    content:
      '"Oh? Do you want me to stop? I\'m sorry if my speech patterns are unusual, I don\'t mean to belittle you at all." The Reaper\'s expression turned into a shocked one, he seemed very apologetic and bowed in response. \n\n"Ignoring that, do you want to do anything in this Space?" \n\n[["Hmm..."]]',
  },
  {
    id: 18,
    name: '"You should have seen it coming."',
    content:
      "(set: $annoyed = $annoyed + 1)(if: $annoyed >= 5)[A sudden thud can be heard. The piano was broken, split in half. The structure of it was entirely broken, and all that remains now is the pieces of wood particles falling onto the ground as The Reaper stood there, with his fist clenched.\n\nHe snapped his head back, and his eyes widened. His irises were glowing red instead of white now. The skies suddenly turned red, and the crows were flocking by to signal you that you have officially messed up. How could a soul drive a Reaper this crazy? \n\nYou could have sworn Reapers would control their emotions better due to them being in the field where it involves the souls of the previously living. There was one factor you missed out on: Reapers were once human.\n\nAs the skies cackles into flames, so too did his mind. A burst of maniacal laughter can be heard escaping the Reaper's mouth as he clutched onto the hair strands that ripped itself away from his scalp. \n\n\"Oh... You just have NO IDEA how much you messed up. Since you want to play that game with me, let's play. You gave me a bad experience, so I'll give you the reason why you were bound to belong in the dirt.\" The Reaper surrounded you with black smoke upon ending his sentence. You could barely see your surroundings, but one thing straight ahead of you was clear.\n\nYou were walking into Death itself.\n\n[[Memory Unlocked.|Memory 6]]](else-if: $annoyed < 5)[The Reaper sighed, but then he started to mutter out curses under his breath. Out of all days to be a stubborn little soul and piss him off, it had to be the last day. Regardless, he let it slide, because this type of energy is too unhealthy for his mindset, and he was pretty sure you only meant to tease him this time around.\n\n\"Okay, please just let me be for this day. You kind of ruined my musician mindset, which results in a few broken keys in my piano, so it's really tough for me or you to have some kind of bonding to recover your memories. So my apologies for this part, but I am expecting your apology as well, not that you need to. Just a suggestion.\" He gently pats your back a few times to make you go away before he starts to work on fixing the piano keys.\n\nSince you had nothing to do, and you were kind of defeated by his reaction, it's best if you just sleep it off and prepare yourself for tomorrow.\n\n[[Sleep.|FINAL DAY]]]",
  },
  {
    id: 19,
    name: '"You\'re surprisingly attractive."',
    content:
      'For the first time, The Reaper\'s cold attitude seemed to break. He stared at the soul in shock.\n\n"What... what do you mean by that?" He asked, looking away from the soul, he seemed to feel a little... flustered at the words, which was unusual. He immediately reassessed himself and continued.\n\n"Anyways... in Heaven Space, you have 3 days until reincarnation. On your final day, you will step into the boat, and you will enter the Light, then you\'ll be reborn. I will keep you accompanied by then." The Reaper placed his scythe next to his, his gaze back to that of a cold, unloving one.\n\n\n[[That\'s a bit short...]]',
  },
  {
    id: 20,
    name: '"...Well I\'d rather just listen to you play."',
    content:
      '(if:$annoyed >= 3)["Suit yourself." And the Reaper went back to playing the piano. You stood beside him as you observed him playing. It felt like you were watching an orchestra, or rather - a solo, up close. \n\nHowever, you felt uneasy. You knew you were supposed to be remembering something at this very moment, and you were sure you were not mistaken at all. You looked down at your feet, and there were thorns beneath your feet. Heaven Space replicates itself after your feelings, which only confirmed it further.\n\n"If you wish, you can lay down. The thorns won\'t hurt, and tomorrow you\'ll be able to leave." The Reaper even gave up trying to fight back against you. You didn\'t want to bother him this time, as you felt bad, so you did exactly what he said.\n\n[[Sleep.|FINAL DAY]]](else-if:$annoyed < 3)[The Reaper nodded in response. "Of course, if you don\'t want to duet then that\'s your own decision. I have no reason to pry further. It is of your utmost comfort, after all. You may stand there and listen in." He cleared his throat before continuing with the music. \n\nAs he pressed every key, a soft hum escaped his lips. His voice and the piano notes harmonized like the sun and moon - they complete a cycle around earth, which in turn, completes each other. The Reaper closed his eyes to feel his spirit flow with the melody, and so did you. Both of you were content.\n\n[[Memory Unlocked. | Memory 5]]]',
  },
  {
    id: 21,
    name: "A beach.",
    content:
      "(set: $beach to true)The space morphs itself into a coast that trailed for miles and miles away, and it's something that's very rare in actual life itself. The sound of sea waves hitting the shore, the sounds of seagulls yelling across the horizon as the sun sets, the clouds basking in the sunset's colors, the reflection of the golden light shines back onto your eyes. Even if the scene feels somewhat empty, it only made the charm that much more special.\n\nWas this your creation? You created this space with your own mind? You were in disbelief, but the world you made helped you ease yourself, the environment guided you into solitude and peace.\n\n[[Memory Unlocked.|Memory 4]]",
  },
  {
    id: 22,
    name: "A busy city street.",
    content:
      "(set: $city to true)The space morphs itself into a busy street, where buildings and people collide and exist as one. A hive of human life. So many passengers flock by to get to their destination - even if they were there to replicate the crowded feeling. The buzzing noises of advertisements and chatter flow around your being, the skies a muddy blue as if it was about to rain onto the utopia.\n\nWas this your creation? You created this space with your own mind? You were in disbelief, but the world you made helped you ease yourself, the environment guided you into solitude and peace.\n\n[[Memory Unlocked.|Memory 4]]",
  },
  {
    id: 23,
    name: "A forest.",
    content:
      "(set: $forest to true)The space morphs itself into an enchanting forest, a kind you would find under a mountain range. The smell of pine trees and oak wood suffocates the atmosphere as the breeze of fall shower down the golden leaves onto the floor. The sound of birds chirping over and over the space made your heart flutter.\n\nWas this your creation? You created this space with your own mind? You were in disbelief, but the world you made helped you ease yourself, the environment guided you into solitude and peace.\n\n[[Memory Unlocked.|Memory 4]]",
  },
  {
    id: 24,
    name: "Accept.",
    content:
      '"Okay, now listen to me. Morph the space into a little pond, maybe in a park or a mini paradise, it\'s not necessary, but this setting has been the most helpful for souls who yearn to seek their previous memories." The Reaper carefully guided you. You immediately followed, and the space soon morphs into a beautiful pond, doused in nature, plants, and all that is home to mother nature.\n\n"Kneel into that body of water, and remember the words I\'m going to say: Think of scenery that resonates with you, your mind, your heart. Do not stress yourself out by imagining too much, just take deep breaths and envision it. In no time, the space will morph itself into the world your heart led you to. Now, go." The Reaper gave you instructions, along with gentle little words of encouragement.\n\nYou followed his guidance and kneeled on the shallow body of water in the middle of the space.\n\n[[Start imagining.]]',
  },
  {
    id: 25,
    name: "Afterwards 1",
    content:
      '"Hey, did I make myself clear?" The Reaper\'s voice echoed, and you were back to reality. You were dead. You start to wonder whether the Reaper had guided more unfortunate souls. \n\n"Just... rest up for today, and we\'ll do whatever we can do tomorrow. We must make haste, however, since you only have 3 exact days before reincarnating. You need some rest right now. Rest well." And he laid you in a comfy bed. You fell asleep, but the tinge of uneasiness still lingers beneath your heart.\n\n[[Sleep.|DAY 2]]',
  },
  {
    id: 26,
    name: "Afterwards 2",
    content:
      '"You okay?" The Reaper rubbed your head as you slowly recollect where you were at. Right, you\'re in Heaven Space. You wondered if your mom had a wonderful time being here as well, and whether or not the Reaper assigned to her was a kind-hearted Reaper or the opposite. \n\n"You were crying a lot of tears, and Heaven Space rained as a result. I\'m assuming you regained a memory that was very dear to your heart, so I will not pry further." He adjusted your head to lay on his lap a little better. Did he place your head on his lap while you were unconscious?\n\n[["How long have I been unconscious for...?"]]',
  },
  {
    id: 27,
    name: "Afterwards 3",
    content:
      "You opened your eyes and you were back to the pond. The Reaper let go of your head and stood up. He did this a million, maybe even billions of times before, but he is proud of himself every single time. You stood up as well to face him.\n\n\"From your face, I can tell that it was a pleasant little memory, which means I helped. You're welcome.\" He nudged your shoulder, gesturing that you should also be proud of yourself for succeeding. That's true - you struggled at first, and without his help, your imagination would have gone nowhere.\n\n\"No need to thank me, I know you were going to. Anyways, this isn't the only way you can regain your memory. If you do some activities with me or maybe by yourself over time, you'll gain more. For now, rest up. You'll need it after manifesting your memory back into the space.\" The Reaper snapped and a comfy bed was next to you. You lie down upon his instructions and fell asleep peacefully. He kept watch of you that night.\n\n[[Sleep.|DAY 2]]",
  },
  {
    id: 28,
    name: "Afterwards 4",
    content:
      '(if: $memory >= 3)["A pleasant memory it was, I hope." His hair fell, covering his face as his fingers plays the last remaining notes on the piano. You felt both of your hearts wither slowly at the weight of realization. It is the last day, after all. He stood up from the stool and held your hand gently.\n\n"I figured you should know my name as well." The Reaper looked so soft, so gentle. The music notes still lingered in his mind as he leaned in closer to your ear. "My name is Percy. Keep it in your heart."\n\nA hand was placed on your chest, where your heart lays. Your heartbeat kept its steady rhythm. A good sign. A broken chuckle escaped his lips, Percy was close to letting his tears loose.\n\nYou noticed the moonlight illuminating both of you, and you noticed how gentle the Reaper looked right now. It wasn\'t even that it was his job to make the soul feel safe by looking safe, it was the fact that this moment felt like it came directly from his heart.\n\n"Tomorrow\'s the day, isn\'t it? Let\'s get some rest. I\'ll keep you company." Percy gestured for you to lie down in the patch of grass, surrounded by forget-me-nots. You lay down and glanced at the stars in the sky, and not soon after, your eyelids closed on themselves. As you fall asleep, you could have sworn your blurry vision saw his fragile smile. \n\nThat night, you felt warmth surrounding your body. You had hoped it would last forever.\n[[Sleep. |Memory 7]]](else-if:$memory < 3)["A pleasant memory it was, I hope." His hair fell, covering his face as his fingers plays the last remaining notes on the piano. He stood up from the piano and gave you a flower. It was a forget-me-not.\n\n"Tomorrow\'s the day you have to enter the boat, isn\'t it? I hope your stay in Heaven Space was pleasant enough." You noticed the moonlight illuminating both of you, and you noticed how gentle the Reaper looked right now. It was his job to make sure the souls reach the other side safely, so making sure the soul feels safe is his priority, after all.\n\n"Rest up. Tomorrow\'s the grand day." As he points at the patch of grass that was surrounded by a beautiful array of different flowers. You lay down and glanced at the stars in the sky, and not soon after, your eyelids closed on themselves.\n\n[[Sleep. |FINAL DAY]]]\n\n',
  },
  {
    id: 29,
    name: "Afterwards 5",
    content:
      'The smoke that was surrounding you had disappeared slowly, and you fell onto your knees at the revelation of your mother\'s cause of death. The Reaper observed you with no emotion.\n\nYour face paled, and your heart sank to your guts as you came back from that memory. What the hell was that and why on earth would all of this happen?! You thought your parents had gotten along so well, and that they were the most perfect pairing to ever exist on the blue planet Earth, so why...\n\n"You intentionally pissed me off for the past few days, of course, bad memories would flock by you. It\'s only the will of Heaven Space, and the Heavenly System itself." The Reaper\'s tone of voice was completely cold, there was no tone, no emotion, nothing. You have made him lose his temper, his cool.\n\n"Think about it. Reflect. Use that mind of yours to think //REALLY LONG AND HARD//: Why has the Reaper been so mean to me, even though his mission is to make sure my experience in Heaven Space is pleasant? Well, jokes on you." He grabbed his scythe and scooped your head up like it was nothing. Your head was hanging onto the scythe\'s dull side of the blade. \n\n"Were the System allowed their servants to execute the souls who have tested them to their limits, I would have beheaded you right here, and left you a wandering ghost for eternity on that godforsaken planet." He threw you down onto the ground face first. \n\n"Maybe strive to be different from your father instead of inheriting his traits. Best to be against not with a villain of your own story. I\'ll welcome you on the boat tomorrow, so sleep well tonight." The Reaper faded away into the stratosphere. \n\nYour neck still hurt from whatever he had just done. It felt like you had just been tortured and suffocated in the span of a few seconds. You caught your breath and stood up as you try to look for the Reaper, but he had already erased the remains of his trails. All you could do was form a bed and fall asleep. Did you even deserve a bed? Regardless, time to rest up.\n\n(text-colour:red)[[Sleep. |FINAL DAY]]',
  },
  {
    id: 30,
    name: "Afterwards 6",
    content:
      '"Have a good rest." The Reaper covered you with a blanket before heading away, but the weight on your eyelids was too heavy for you to even see where he had faded too. You tried to reach your arm out, but now it wavers around the edge of your bedside as your head sinks further into the comfortable pillow.\n\nIn just a few moments, you fell into a deep sleep.\n\n[[Fall asleep. |DAY 2]]',
  },
  {
    id: 31,
    name: "Apologize.",
    content:
      '(set: $annoyed = $annoyed - 1)(if: $annoyed >= 3)["Now why on earth would I believe in your words? Throughout the 3 days, you have done nothing but make my blood boil, I wonder if it is entertaining for you because it is not. I am pissed that the Heavenly Systems would forbid us from executing the souls from misbehaving because as soon as it is allowed, your soul wouldn\'t exist." He ranted on and on about his anger and hatred towards you, but then he soothes himself down.\n\nThis was extremely unprofessional of him, but can you seriously blame him? He had to deal with a nuisance, a menace at heart and mind. "At least you dared to own up and apologize. I am sorry for lashing out at you like that. That doesn\'t mean you get my forgiveness, which is good because I do want to detach from the souls I have to accompany that much easier, so I must thank you in a way." The Reaper ruffled his hair up as a sigh escaped his dry lips. He glanced at you before looking away.\n\n"Just rest up for today. I don\'t have the energy to help you with your memories, and that it\'s a bit too late anyways. Have a good one." He spoke one last time before walking away to distract himself. You listened to him and went to the bed you manifested and fall asleep shortly after some repetitions of breathing practice.\n\n[[Sleep. |FINAL DAY]]](else-if: $annoyed < 3)[He let out a soft sigh as he held his head with his palm. "Good, at least you owned up." He scooped up the back of his hair to tie it up as he proceeds to fix the damaged keys of the piano. \n\n"Please, never do it again." The Reaper spoke softly, but you could barely hear his words. You stood aside, watching him fix the keys. Hours passed, and he finally managed to fix it. Was Heaven Space unable to fix this for him?\n\n"You may be wondering if Heaven Space could fix my piano, and no, it could not." How did he read your mind?! "This piano is of my possession, so naturally it does not belong to Heaven Space. How I brought it in is out of your question." The Reaper dusted the dirt off his face and shirt as he glanced up at the sky.\n\n"It\'s night already, let\'s get you to rest."]\n\n[[Sleep. |FINAL DAY]]',
  },
  {
    id: 32,
    name: "Ask about his job and identity.",
    content:
      "\"You surely know me as The Reaper. However... I do have a name, but I don't feel comfortable using it sometimes. Besides, I don't use this name often, as I would rather prefer being called by my profession. However, knowing your companion's name brings closure and comfort, so I do not blame the souls that prefer this. Hence why I have a name.\" The Reaper revealed more information about himself to you. He doesn't seem to be bothered by the fact that you know. You might forget about all this... right?\n\n\"As for my profession, just know that we Reapers are supposed to keep the souls accompanied before their initial rebirth. The fate of the souls being able to rebirth or not depends entirely on Heaven Space's judgment, and whether or not you were able to regain your memories.\" He slouched over as he sat down, info-dumping you about every detail of his job.\n\n[[...|Attempt to gain memory.]]",
  },
  {
    id: 33,
    name: "Ask about the secrets of the government.",
    content:
      '"Very funny, but no." The Reaper punched a fact into your face just like that. "You don\'t even have a job that is related to the government. Yes, I know I\'m a hypocrite for saying you can ask me for anything regarding the space, me, or unrelated things, but that doesn\'t mean I go around to spew the secrets." He was unimpressed, and so was you. \n\n[[Press him about it further.]]',
  },
  {
    id: 34,
    name: "Ask nothing.",
    content:
      "\"Nothing you want to ask about? That's fine by me. Not that many souls will have something to think about, so you're fine.\" The Reaper gave you a small nod, his attempt at trying to be understanding. He placed his scythe down next to him to not scare you off too much. \n\n[[...|Attempt to gain memory.]]",
  },
  {
    id: 35,
    name: "Ask why flowers are endearing to Reapers.",
    content:
      "\"Flowers are like souls. They come and go. They will blossom, showing the world their best self, but then wither away as they age, just like the lifespan of all living beings. But that's alright, as long as they were happy when they blossom, I'm content. It means they've embraced themselves into their beauty, and that's admirable.\" He placed the flower wreath he made onto your head, admiring his (below-average) work of art.\n\n\"I'm sure you think the same as well.\" He played with his thumbs, as he laid down on the grass, his eyes still keeping watch of you. You felt happy just listening to him ramble about anything.\n\n[[Memory Unlocked.|Memory 3]]",
  },
  {
    id: 36,
    name: "Attempt to gain memory.",
    content:
      '"Question: Do you want to try and regain some memories? By asking, I meant you need to try. It is vital that you attempt at the very slightest. It\'s okay if you want to decline if it\'s a bit too much for you. I\'ll be here still." The Reaper gave you a suggestion and gave you some time to think about it.\n\n"So? What will it be?"\n\n[[Refuse.]]\n[[Accept.]]',
  },
  {
    id: 37,
    name: "DAY 1",
    content:
      '(set: $memory = 0)(set: $sleep = 0)(set: $annoyed = 0)(align:"=><=")[DAY 1.]\nYou slowly woke up to an empty sky. There was no variation to the sky, not even a single blob of cloud, not even the sun rays, nothing. Just an empty white sky. Was today a strange occurrence, and more importantly: Why were you asleep?\n\n[[Get up.]]',
  },
  {
    id: 38,
    name: "DAY 2",
    content:
      "(align:\"=><=\")[DAY 2.]\nToday, you were greeted with a beautiful little flower field that encased the empty plains of the space. It had the flowers you had ever loved and adored all your life, and the leaves were falling as you felt the recreation of a summer breeze.\n\nThe Reaper stood beneath the shadows of the huge tree in the middle of it all and waved at you. His cloak seems to be off for today, which highlighted more of his bodily features, such as his scars, and his stitches. Of course, that's his privacy, so you won't pry further.\n\nWhat are you going to do?\n\n[[Grab a few flowers to make a flower crown.]]\n[[Provoke him.]]\n[[Fall asleep. |Sleep 2]]",
  },
  {
    id: 39,
    name: "DAY 3",
    content:
      '(align:"=><=")[DAY 3.]\n\nOn the last day, you noticed the Reaper playing a tune on the piano, seems like he has an ear for being a musician. On further inspection, he was playing the melody to Claire de Lune, a classic piece of music. As the music fulfills the empty and silent atmosphere, so too did the Reaper\'s sentiment.\n\nAs the music carries him away, you approached him from behind. \n\n[["Were you always a musician?"]]\n[[Scare him.]]\n[[Fall asleep.|Sleep 3]]',
  },
  {
    id: 40,
    name: "Don't pry further.",
    content:
      "You stood silent as you carefully observed the details that were on his flower wreath. It contained lavenders, forget-me-nots, and a random array of leaves. The branches were poorly trimmed, so it looked like it would hurt were you tried to wear it. Hell, considering how sharp the ends of the branches are, you would bleed.\n\n\"You can't bleed in Heaven Space. You're technically a soul, so it would be weird for you to really have bodily fluids.\" How the hell did this man just read your mind?! \"That's the reason why you don't feel hungry or thirsty either unless you want to consume your favorite drinks and dishes, then you can manifest it into Heaven Space. As for where it goes, it just poofs. You'll feel full still so no worries.\"\n\n\"Regardless, as long as you'll fulfill your wishes, you'll no longer be a dreamer, but a winner.\" He wore his wreath and gave you a smirk. You felt happy just listening to him ramble about anything.\n\n[[Memory Unlocked.|Memory 3]]",
  },
  {
    id: 41,
    name: "Enter the boat.",
    content:
      '(if: $sleep is 3)[You felt empty. Throughout all your time in Heaven Space, all you did was sleep. Was there anything you could have done? Or did you thoroughly waste your time? There was nothing you could do anyways, and you fell asleep once more on the boat as you enter the Light. No looking back now.\n\n(text-colour:#95b3d0)[(text-style:"smear","buoy")[\'\'SLEEP ENDING: \'\'Will there ever be someone to wake you up?]]\n\n[[PLAY AGAIN?|DAY 1]]](else-if:$memory is 4 and $annoyed is 0)[You hesitantly entered the boat. You really wish you could snap your head back to look at the Reaper you spent your last remaining days with, but per his wish, you will not. As you observe the water, it remained still, the boat creating gentle ripples in the waves. The breeze from the light slowly overflows you, blowing your hair away. It was getting brighter and brighter.\n\n(text-colour:#c2befe)["Live on well for me!"] Percy yelled from the horizon. The echos of his voice ended as soon as you entered the Light. You were reborn, with no burden, with no regrets.\n\n[[Wake up.|Epilogue]]](else-if:$annoyed is 5)[The waves to the Light were starting to be unstable. The atmosphere turned into a sea of red, as thunders and tsunamis covered what was surrounding your one-way ticket to rebirth. As you attempt to stay stable on the boat, the phenomena only grew stronger, and more dangerous by the ticking second.\n\n</style>\n<img src="https://media.discordapp.net/attachments/885350278013009990/1314241241973657611/bad_end_lead.png?ex=67530e09&is=6751bc89&hm=e202df29e927351e64106c79d742f281151fcd72fbe9e82623e032cb3fccb4bc&=&width=1193&height=671"width="800"object-fit="contain">\n</div>\n\nAnd before you knew it, you had fallen into the abyss, your vision muddy and unclear, your soul bound into the chains of the depth. Before you knew it, all you could see was nothingness. Before you knew it, what was of you never existed anymore.\n(text-colour:#b50d0d)[(text-style:"smear","buoy")[\'\'BAD ENDING\'\': Your actions have consequences.]]\n\n[[PLAY AGAIN?|DAY 1]]](else-if: $annoyed <= 4 and $sleep <= 2 and $memory < 4)[As you slowly enter the Light, you waved back to the Reaper that had welcomed you to the Space and bid you farewell onto your journey. It was a pleasant 3 days, you both had no regrets. Well, let\'s hope in your next lifetime, you are born into a billionaire family, and that you are filthy rich. \n\nKidding, of course. But you hope it was just a normal life.\n\n(text-colour:#a1bab6)[(text-style:"smear","buoy")[\'\'NEUTRAL ENDING: \'\'Who knows what comes next in your next lifetime?]\n\n[[PLAY AGAIN?|DAY 1]]]]\n\n',
  },
  {
    id: 42,
    name: "Epilogue",
    content:
      'After you were reborn, you were born into a well-off family. Your parents are geniuses of science and philosophy, and so are your siblings. You felt lucky for being born into a loving family like this. \n\nOn a family dinner night, as your family recalls every memory, they glanced at you and started to discuss everything about you. They described your birth being a miracle: your mother recovered twice as fast compared to an average human after giving birth; your intelligence was more advanced, you were a gifted kid.\n\nOne more thing they pointed out was your birthmark in the middle of your collarbone: a star. The media called it the Nova phenomenon. It is said that only a select few will have the birthmark and that they are destined for greatness. Your parents boasted about just how lucky they were.\n\nYou rubbed your birthmark as you laughed at their bantering, but nothing could explain why you felt a sense of familiarity whenever it was mentioned. It reminded you of someone close to you, but you don\'t know who that someone is.\n</style>\n<img src="https://media.discordapp.net/attachments/885350278013009990/1314241243408109628/epilogue.png?ex=67530e09&is=6751bc89&hm=077897479757febf0b33aff325f67ccfd7f366a4bad035988710cffdb1fa0913&=&width=1193&height=671"width="800"object-fit="contain">\n</div>\nAll you knew, was that they were your friend.\n\n(text-colour:#c2befe)[(text-style:"smear","buoy")[\'\'TRUE ENDING\'\': Blessed by the undead.]]\n(text-colour:grey)[This concept and story are dedicated to my late best friend Ryuki.\n\nTotal word count: 12k.]\n[[PLAY AGAIN?|DAY 1]]',
  },
  {
    id: 43,
    name: "FINAL DAY",
    content:
      '(align:"=><=")[FINAL DAY.]\n(if:$annoyed is 5)[You weren\'t able to sleep with how uneasy you felt, especially after the unending approach of the final day. You stood up when it was time. \n\n(text-colour:#f00)["Hey, so it is time, after all."] The Reaper glanced at you, a cold one. The skies of Heaven Space became a thunderstorm, the embodiment of the anger and tears shed by nature. The figure stood in front of you, wielding his scythe. Suddenly, you noticed the number of tombstones behind him, all engraved with your name.\n</style>\n<img src="https://media.discordapp.net/attachments/885350278013009990/1314241242909114490/bad_end.png?ex=67530e09&is=6751bc89&hm=f52a6efee7519323b8f7fe84a7c75af9bcccbb5a7480d88573c8f3082d9aba6c&=&width=1193&height=671"width="800"object-fit="contain">\n</div>\n(text-colour:#f00)["Come on. Why don\'t you enter the boat, since you\'re so eager to leave so much?"] He threatened. His voice echoed through the horizon. A lingering fear went down your spine. \n\n(text-colour:#f00)["So? Don\'t be shy from being cocky now, since you chose to be so."] He pointed the tip of the scythe at your neck, before moving it to the boat. \n\nYou need to enter the boat, after all.](else-if:$sleep is 3)[(text-colour:#95b3d0)["Hey, wake up."] The Reaper shook you awake, his expression concerned for you. You have spent the last 3 days just sleeping, after all, so was there really any surprise?\n\n</style>\n<img src="https://media.discordapp.net/attachments/885350278013009990/1314241245400399942/sleep_end.png?ex=67530e0a&is=6751bc8a&hm=ae37ca2a9aca816c972708a454dad891c36572bb0ee3cea08bd2fcc2cd09c69e&=&width=1193&height=671"width="800"object-fit="contain">\n</div>\n\n(text-colour:#95b3d0)["Look. I know you really love sleeping, in fact, you have done nothing in this space but sleep, but you need to step into the light now. It\'s your time."] He tried to carry you up to the boat. For some reason, you felt heavier compared to the average soul to him. Souls are meant to be floating, but the weight on your eyelids seems to have affected the gravity of the space, and this situation.\n\n(text-colour:#95b3d0)["Come on, stand. You can do this- Okay. Now step into the boat. Please."] He pleaded.](else-if:$memory is 4 and $annoyed is 0)[(text-colour:#c2befe)["Hey... Wake up please?"] The Reaper - well, Percy - shook you gently. He gave you a soft little smile, but deep down, his heart yearned for this moment to halt, for it to stop for just one second. But all souls must move on - this is the case for all the souls he got attached to, after all. As you wake up, he gave you a soft hug.\n</style>\n<img src="https://media.discordapp.net/attachments/885350278013009990/1314241241268883456/good_end.png?ex=67530e09&is=6751bc89&hm=6243cee833dcaf2c7974bfb9856ce22c8ebd993abb948072a7de31ff8e55c197&=&width=1193&height=671"width="800"object-fit="contain">\n</div>\n(text-colour:#c2befe)["Listen, when you enter the Light, do not glance back. Enter the Light with pride, knowing you were able to find yourself, knowing you made a friend here in Heaven Space. Reincarnate with no regrets. That\'s all I ask of you."] His tone of voice was soothing and gentle, Percy only wanted to make sure you enter the light in one piece.\n\n(text-colour:#c2befe)["Ah, wait, one more thing."] He reached out inside his pocket to give you a crystal key. (text-colour:#c2befe)["You will be needing this. Consider this a blessing from the undead."] He placed it carefully into your hand, making sure you would not drop it.\n\n(text-colour:#c2befe)["Now... Go. Promise me you\'ll prosper in your next life."] He released the hug and stepped back as he watches you stand at the dock. This was goodbye.](else-if:$annoyed < 5 and $sleep < 3 and $memory < 4)[The Reaper waited for you to wake up from your slumber, as he stood by the dock, the wind coming from the shore swept its way up to the air, almost knocking the hood of his face down. He turned his body to look at you.\n\n</style>\n<img src="https://media.discordapp.net/attachments/885350278013009990/1314241244070674432/neutral_end.png?ex=67530e0a&is=6751bc8a&hm=3cf5970f343d9e7050ed30b9d9323f552d708acb33252a4c54760863691d45ab&=&width=1193&height=671"width="800"object-fit="contain">\n</div>\n\n(text-colour:#a1bab6)["It\'s time."] He let out a hand for you to reach out and hold. As you held his hand, he guided you to the side of the boat. The Reaper then let go of it and stepped back, not even a single word said afterward. \n\nNo looking back now.]\n\n[[Enter the boat.]]',
  },
  {
    id: 44,
    name: "Get up.",
    content:
      'You lifted your torso to see... nothingness. A void, a skybox with nothing inside it. //Surely this must be a little delusion, or a weird dream,// you thought. \n\n"You\'re awake, aren\'t you? How are you feeling?" A deep, raspy voice that sounded almost echoey spoke into your ear. You turned around to see a shadowy figure, with his hood covering a good portion of his face.\n</style>\n<img src="https://media.discordapp.net/attachments/885350278013009990/1314241244729315389/opening.png?ex=67530e0a&is=6751bc8a&hm=5c136e58b4aab3af41b452b4e2ea2f8d4d5ed09fd4de4fa37ae0e50adfb503ef&=&width=1193&height=671"width="800"object-fit="contain">\n</div>\n\n[["Who are you?!"]]\n[["Where am I?"]]\n[["..."]]',
  },
  {
    id: 45,
    name: "Grab a few flowers to make a flower crown.",
    content:
      "You decided to pick out a combination of flowers, all in different colors, to sew into a beautiful woven flower wreath. It had all the flowers you found enchanting, beautiful, and mesmerizing. The Reaper took notice of this and sat down with you. \n\n\"I'm assuming you used to do this a lot, considering how well you've made this.\" He commented. \"Some people I've met are florists as well. They're very good with their craft, so I'm glad someone that matches the same skills. Flowers are very endearing to Reapers.\" He revealed as he tries to make one as well. It didn't look too shabby, and he did pick those associated with the color purple. \n\n[[Ask why flowers are endearing to Reapers.]]\n[[Don't pry further.]]",
  },
  {
    id: 46,
    name: "Hang with the Reaper.",
    content:
      'You decided to spend your time knowing more about this figure that you had just met. You sat down next to him, gesturing him to follow suit and he did.\n\n"Is there anything you wish to ask of me? Any wonders, thoughts, questions, anything? It could be about me, this space, or any knowledge of the world. The only thing I shall not answer about is your memories. That is for you to find out on your own.\n\n[[Ask about his job and identity.]]\n[[Ask further about Heaven Space.]]\n[[Ask about the secrets of the government.]]\n[[Ask nothing.]]',
  },
  {
    id: 47,
    name: "Jesus Christ...",
    content:
      'The Reaper pulled back afterward and went back to his gentle smile. "Well, sorry for being so dramatic, was trying to send chills down your back." He let out a chuckle, knowing you were pissed off about that.\n\n"Regardless, please just keep watch of what you do here. Yes, do whatever you want, but remember this one important rule," The Space flashed red for just a second. The empty plains were now a graveyard engraved with your name on every single tombstone.\n\n\'\'"Your actions have consequences."\'\'\n\nThe space soon turned itself back to the previous state once more.\n\n[[...|Attempt to gain memory.]]',
  },
  {
    id: 48,
    name: "Keep going with the provoking.",
    content:
      "(set: $annoyed = $annoyed + 1)(if: $annoyed >= 2)[The Reaper stood silent. He starts to growl, listing all of the curses and insults he had ever learned from the millions of souls he met, alongside studying the language of humanity, but due to his good conscience, he will not.\n\n\"Okay, I don't know what kind of incentive drives you to maybe provoke me, but I am being very patient with you right now. You're probably being managed by one of the most patient Reapers out there because if it were anybody else, they would have gone mad.\" He explicitly stated a fact out of purely just being pissed off.\n\nYou gave yourself some time to think about it: Just how many Reapers are there outside of just him? Do they all have different personalities? Do they all have different characteristics? Do they have some sort of ranking? Do they-\n\n\"I'm leaving this haven all to yourself. I can't be bothered to spend time with some idiotic soul whose only entertainment is to provoke and harass other people.\" The Reaper faded away, leaving you all alone in the flower field.\n\nYou sat down to make a flower wreath, but it came out to look as horrible as that personality of yours, so you just simply lie down and sleep it off. Tomorrow will be a better day.](else-if: $annoyed < 2)[The Reaper laughed it off but still felt weird about it. He took it in as some kind of joke or quirk you always do with your friends while you were still alive and didn't think much of it. Still, he's agitated.\n\n\"Okay, it's best to stop now. It's funny, I know, but you're actually hurting my feelings here, dove.\" He scoffed as he nervously let out a chuckle. \"I'll have you know that naughty souls will not be well off, hell, might not even be able to enter the Light.\" \n\nThe new fact left you uneasy, your stomach pretty much queasy after knowing just how awful you had to be if even Heaven Space won't allow you into the Light. The Reaper noticed this and pushed you down onto the empty patch of grass beneath you. You are now a ghost encased by bloom.\n\n\"Maybe you should get some rest if that fact really scares you that much. Don't worry, I'll be here.\" He gave you a wink before sitting down next to you, keeping an eye on you. Time to get some shut-eye, you wanted to get rid of this uneasiness inside your soul.]\n\n[[Sleep.|DAY 3]]",
  },
  {
    id: 49,
    name: "Listen to him.",
    content:
      "(set: $annoyed = $annoyed - 1)(if: $annoyed >= 1)[He glared at you for a second before releasing his grip on the scythe. \"Maybe you aren't so bad after all. But just... don't- seriously don't attempt it next time. It's seriously irritating.\" He went off before fading away into smoke, then it was nothing.\n\nYou were left alone at the field, the wind grazes through your hair, but the chills were from a different source. Perhaps you should lay low with pissing off your only friend at this current time. Either way, that made you kind of upset. So you decided to lie down and think about nothing. Perhaps it's for the better.](else-if: $annoyed < 1)[The Reaper let out a soft sigh as he was relieved you were able to listen to him. He gave you a little shoulder rub and a gentle smile.\n\n\"I'm glad you're listening. We Reapers are like humans, just that we are immortal and we carry a heavier duty than just living on Earth. Well, to be fair, we were once human. Then we volunteered for the Heavenly System.\" He revealed a little fact as if it was a reward for being sympathetic. Weird...\n\n\"Anyways, you can do anything you want today, but I wouldn't be involved. You did kind of hurt my feelings. Yes, I know, it's just a minor little tease from you, but your words were... well... it hit close to home. So please, don't do it next time.\" Afterward, the Reaper gave you a little wave before fading away. You were left all alone now.\n\nYou sat down and started to make a flower crown for yourself, using the different flowers that blossomed on the patch of grass. Not too bad, you kind of wish the branches weren't so sharp, however.\n\nYou placed it onto your head and lie down on the patch of grass, observing the clouds. Soon after, it was pitch black. You had fallen asleep.]\n[[Sleep.|DAY 3]]",
  },
  {
    id: 50,
    name: "Memory 1",
    content:
      "(set: $memory = $memory + 1)You were 5 years old. It was a stormy night, just as the weather forecast had expected, and the thunders were so loud you weren't able to sleep. Just then, you felt your mother's gentle touch on your face, reassuring you that it was alright. The notes of the nursery rhyme she hummed replayed in your mind, ''it was a melody you could never get tired of''. \n\nHow you miss the comfort of your mother's touch, how you miss the sound of thunderstorms, how you miss being young and childish. Now it's all gone, only the memories remain.\n\n[[Listen in to the whispers.|Afterwards 6]]",
  },
  {
    id: 51,
    name: "Memory 2",
    content:
      'You were 10 years old, and you and your family were walking on a street together after a lovely family dinner outside when suddenly some commotion happened nearby. You took a glance over at the source of the sound and noticed that a boy, seemingly your age at the time, was getting beaten up by his mother. His screams were vocal, echoing across the street like thunder striking down. \n\nA heavy weight hung itself onto your heart as it sank. Your eyes widened, and your expression paled. All the people who heard the cries watched. but they never intervened. Your mother grabbed your wrist and dragged you along after noticing you were trailing behind. \n\n//"Don\'t pay attention. The kid must have done something to piss her off. Best to let nature runs its course." //\n\nEven now, you still felt the bone-chilling sensation down your spine. The boy was helpless, and you were unable to save a life.\n\n[[Come back to reality.|Afterwards 1]]',
  },
  {
    id: 52,
    name: "Memory 3",
    content:
      "(set: $memory = $memory + 1)You were 17. The smell of flowers overflowing your house was something you'd grown accustomed to. After all, your mother would go to the local florist shop every weekend to buy new flowers to decorate around the house. She had the eye of an artist. \n\nAll the flower vases she placed around the rooms: one on the coffee table of the living room, one on the counter of the kitchen, one on her bedside, one on yours. It felt like a forest of bloom, like an arrangement of greenery welcoming you into their paradise.\n\nShe would sometimes make you a flower wreath, just like the one you have now. You reminisce about the smile she gave you whenever she made one consisting of different flowers. You reminisce about the different pattern combinations you could make with yours. You reminisce about the photos she would take of you wearing them.\n\n''You reminisce the tears flowing down your face as she wore the one you made for her on the day of her departure, away from her lifetime.''\n\n[[Come back to reality.|Afterwards 2]]",
  },
  {
    id: 53,
    name: "Memory 4",
    content:
      "(set: $memory = $memory + 1)Your father would always invite you to watch documentary TV with him. It could be anything: About society, nature, animals, about knowledge, and you would come and watch with him. Because of him, you had indulged in the wonders of the world, the beauty that Mother Nature has to provide, and the complexity of humanity.\n\n(if: $forest is true)[At night, you would stay up researching the exotic plants, finding more information relevant to the certain type of species you favored. You even asked your dad to invest some money into hiking so you were able to explore a forest on your own.\n\nAs you enter the forest, you took every single photograph of what's there to behold. The forests of Earth were like a terrarium encased in a floating sphere for you, and you're glad you are part of it. You are sad to see the world will crumble someday due to pollution.](else-if:$beach is true)[During summer holidays. your family would take a road trip to a little town near the sea, where the sea waves hit the sand as the moon commands. You couldn't sleep at all from excitement, even if this is the millionth trip to the same location. The tidal force the moon had on the sea also affected you, so you and the sea were one and the same.\n\nThe breeze of the sea would always be so refreshing. In the comfort of your bedroom displays different collections of seashells and other artifacts you find on the shore, as well as photographs of the colorful coral reefs that lay residents on the seabed. You wanted to become one with the marine. You wished it had happened.](else-if:$city is true)[Every once in a while, you took a train to go to the city. No matter if the duration of the trip was only a few minutes or even the entire day, you were content with being able to submerge yourself in the modern world, where humanity gathers around every hour.\n\nFrom day to night, the buzzing noises and the atmosphere of the city would overwhelm you in a good way. It felt like you were surrounded, but you belonged, and it was all that mattered.]\n\n[[Come back to reality.|Afterwards 3]]",
  },
  {
    id: 54,
    name: "Memory 6",
    content:
      "You had no idea how old you were when this memory occurred, but you knew it was when you were attending school. You were at the age where you are starting to be a teenager, experiencing puberty and complex feelings. You noticed that your mother and father had been distancing from each other, which worries you a lot. They were your world, and to see it shatter in front of you was a big deal.\n\nIt was 2 AM, and you were on your phone, sneak texting your best friend because they couldn't fall asleep, after all, the graduation party was on the last day of the month, so it's natural to be excited. Suddenly, you heard the commotion from outside of the living room. You sent them a message to be right back and checked.\n\nYour mother and father had been arguing for hours, and it escalated into the living room. Your mother was crying and screaming while your father was silent and expressionless. Turns out, she had found out about his infidelity, that he cheated on her with a woman from his workplace for several years.\n\nYour mother wept for the knife that was your father's mistake that stabbed through her heart, and soon after, from an imaginary knife, it became a real one. Your father had enough of her wailing and put an end to her life right then and there.\n\nYou remembered vividly the blood that spilled out of her organs as your father stabbed her again and again and again. You couldn't move, speak, breathe, or blink. You were frozen in place like a statue. \n\nIn the end, your father lied to the cops about her being stabbed by a criminal who had intruded your home, and acted as if she never existed in your or his life. You wanted to inform the police - you want to expose your father’s deeds - but you knew you were going to be met with the same fate as your mother once you step an inch near the station, so you kept your silence about the wrenching truth.\n\nYour father's cruelty had created a scar in your heart that would not heal for years to come.\n\n(text-colour:red)[[HAVE YOU FINALLY REALIZED YOUR FAULTS?|Afterwards 5]]",
  },
  {
    id: 55,
    name: "Nothing.",
    content:
      "Despite the fact that the Reaper was there to guide you to where your heart considers home, there was none that appealed to you. No location felt like you belonged, you felt like a stranger lost in the wonders of the world. You opened your eyes, and the space was back to it's original state: an empty slate.\n\nThe Reaper sighed as he removed his hands away from your head. \"Sorry, I thought I could have helped somehow, as this is one of the more significant ways to regain your memories. ''There is no pressure to feel belonged, you can still be an adventurer.''\" He shook his head in disappointment. This wasn't the first time this had happened, but that doesn't mean he doesn't get to feel bad about it.\n\n\"Let's just try this again tomorrow, shall we? If you want to of course, or maybe do something else, because this might lead you nowhere, and we have already wasted a lot of time trying. Rest well.\"\n\nThe space formed a comfy bed for you to lie down, and soon you found yourself falling asleep in no time. Your heart slowly accepted the nothingness of it all.\n\n[[Sleep.|DAY 2]]",
  },
  {
    id: 56,
    name: "Press him about it further.",
    content:
      "He got annoyed, but deep down he found all this amusing and fun to mess around. \"Fine! Fine. Do you know about the myth of the pigeons being government drones? Yeah. It's true. Hence why you never see baby pigeons around at all. Happy now?\" \n\nThe Reaper just spewed the biggest lie he has ever told, and you know damn well it was a lie. Still, you're satisfied that you got a reaction out of him. That's what matters.\n\n[[...|Attempt to gain memory.]]",
  },
  {
    id: 57,
    name: "Provoke him.",
    content:
      '(set: $annoyed = $annoyed + 1)(if: $annoyed >= 2)[The Reaper had a more annoyed tone in his voice today. "Ah, really bold of you to do it once more when I told you yesterday you couldn\'t do that. Well, you could, but not that many souls were as challenging as you." He spoke, latching onto his scythe.\n\n"I advise you to cease." A vein popped in his head because this was going to be irritating if this goes on. This should be the time you stop now before anything escalates.](else-if: $annoyed < 2)[The Reaper widened his eyes at the sudden degrading sentence that escaped from your mouth. "Jeez, where the hell did you learn that from?" He scoffed at your poor attempt to insult him, thinking it was funny.\n\n"Listen, I know it\'s to be friendly with me, and I really appreciate that, but maybe it\'s not the best course of action to mock a Reaper...? We have feelings too."]\n\n[[Keep going with the provoking.]]\n[[Listen to him.]]',
  },
  {
    id: 58,
    name: "Refuse.",
    content:
      "\"Wha- Really?\" The Reaper snapped his head at you, shocked that a soul would be refusing this out of anything. \"Jeez... This isn't the first, but it's so rare for this to even happen.\" He shriveled his head in confusion, he's a little bit of a mess.\n\n\"Sigh... I really can't say anything. If you wish to not pry in further, then I shall respect your wishes.\" As he finished talking, he faded away into the stratosphere. There was not a single trace of him left within the space. You can't even command Heaven Space to call him back - he was not a culmination of Heaven Space, after all.\n\nFor the next three days, it was you, all alone within the space. The only thing you did was stare up into the blank sky, where no clouds and stars lie. On the final day, you simply stepped into the boat and just wondered: what could have happened if you accepted? Oh well, you have already entered the Light.\n\n''WEIRD ENDING'': ...What the hell just happened???\n(text-colour:grey)[(You have to click accept. It's the only way to progress. Don't be stubborn.)]\n\n[[Go back.|Attempt to gain memory.]]\n",
  },
  {
    id: 59,
    name: "Say nothing.",
    content:
      '"Let\'s skip all the pleasantries and introduction, shall we? Do you want to do anything in this Space?" The Reaper tilted his head, awaiting your answer.\n\n[["Hmm..."]]',
  },
  {
    id: 60,
    name: "Scare him.",
    content:
      '(set: $annoyed = $annoyed + 1)(if: $annoyed >= 4)[The Reaper\'s slender hands slammed onto the piano keys as you scared him. He was too tranced by his own music, so the sudden scare was uncalled for. He clutched onto the edge of the keys, his hands shaky, his hair shriveled up. You swore you could hear him say curses under his breath.\n\n"I swear to god. Either I must be very unlucky to have you assigned to me, or I am being way too nice." The Reaper was clearly annoyed, enraged even at the fact that you were bold- no, //arrogant// enough to mess up his rhythm.](else-if: $annoyed < 4)[The Reaper\'s slender hands slammed onto the piano keys as you scared him. He snapped his head back to look at you, a bit frightened. Seems the undead was too tranced by the music he played with his own hands. He let out a soft whimper as he tries to regain his composure.\n\n"Hey! That\'s rude to even ruin a musician\'s momentum!" He caught his breath and used it to yell at you. The Reaper stood up to check if any of the keys inside were damaged upon impact, leaving you to stand there.]\n\n[[Apologize.]] \n[["You should have seen it coming."]]',
  },
  {
    id: 61,
    name: "Sing along with him.",
    content:
      "(if:$annoyed >= 3)[\"Sure. Sit down next to me.\" The Reaper gave a glance at the vacant spot on the stool next to him. He thought a bit about which song to play for the duet, chose one, and gave you the lyrics sheet. The song was Lovers Rock by TV Girl. \n\nYou sat down as you slowly submerge yourself into the melody. Then, the Reaper gestured for you to start singing. A duet for the crowd of two people, just you and him, both to savor. Even though you felt like you resonated with him, you didn't really connect. You knew there was something that was supposed to click, but it never came.\n\nAt the end of the duet, you gave the both of you a small clap, but the Reaper didn't pay any mind and left you with the piano. You guessed that he was just detaching himself from you, after all, your departure is tomorrow.\n\nYou manifested a comfy bed for you to sleep on, and shut your eyes tight.\n\n[[Sleep.|FINAL DAY]]](else-if:$annoyed < 3)[\"Of course. you may sit down next to me.\" The Reaper pats the vacant spot on the stool next to him. After you've sat down, you cleared your throat and practiced your high notes meanwhile he choose a song for the both of you to duet. It didn't take long, and as you both review the lyrics and notes for a little while, he kept glancing back and forth between the music sheet and you. It felt nice to have a companion, someone who actually shares moments with you.\n\nOne, two, three. He strikes the first few piano keys with passion. You started singing the words that tie themselves to the song. The song is: Look At The Sky - by Porter Robinson.\n\n[[Memory Unlocked. | Memory 5]]]",
  },
  {
    id: 62,
    name: "Sleep 2",
    content:
      "(set: $sleep = $sleep + 1)(if: $sleep >= 2)[You decided to lay on the nearest patch of grass that wasn't covered by the field of flowers and fall asleep slowly there. The Reaper found it odd - did you like sleeping that much? Regardless, he decided to let you sleep it off. \n\nYou spent that day doing nothing but sleeping. The grass that flows beneath your body halted as the flowers closed their petals to ready themselves for the unopposed approach of the moon.](else-if: $sleep < 2)[You decided to lay on the nearest patch of grass that wasn't covered by the field of flowers and fall asleep slowly there. The Reaper found it funny, and so he laid beside you as well but still stayed awake. He didn't have the need to sleep, so why should he sleep? \n\nHowever, he was a bit agitated. By sleeping through the day, you miss out on your chances to regain any memories. He had prayed that you were just exhausted today, and the environment was enticing you to fall asleep.]\n\n[[Fall Asleep.|DAY 3]]",
  },
  {
    id: 63,
    name: "Sleep 3",
    content:
      "(set: $sleep = $sleep + 1)(if: $sleep >= 2)[The melody was swooning you back to your slumber once again. The Reaper, knowing that you fell into your slumber once more, felt defeated and disappointed.\n\nWas there seriously nothing he could do to keep you awake, maybe to spend some time with him, or maybe even find fragments of your past? Or was it that he was uninteresting? Or was it that you felt defeated by your death and that you just wanted rebirth to come along already? \n\nThere was no answer, as you are already asleep.](else-if: $sleep < 2 and $annoyed >= 3)[The melody was swooning you into your slumber. The Reaper took notice of this and stood silent. He did dart you a little glare, however. You have been nothing but a nuisance of a soul for him. As he played away, he silently wished that today would be over already, so you would pass on and he wouldn't have to deal with you for yet another day.](else-if: $sleep < 2)[The melody was swooning you into to your slumber. The Reaper, knowing that you fell into your slumber, gave you a soft little smile. He gestured for the space to let you sleep into a comfortable little bed.]\n\n[[Sleep.|FINAL DAY]]",
  },
  {
    id: 64,
    name: "Sleep.",
    content:
      "(set: $sleep = $sleep + 1)Heaven Space soon formed a comfy little bed for you to lie down in. You rested your back onto it, the feeling of your body sinking into the cushions felt like you were home. Were you actually home, or was Heaven Space too nice to the point of recreating said feeling for you?\n\nRegardless, your body felt like it had not slept in millennia, as if a pile of rocks was atop your corpse. You closed your eyelids, awaiting for that melatonin to hit in.\n\n[[Memory Unlocked.|Memory 1]]",
  },
  {
    id: 65,
    name: "Start imagining.",
    content:
      'Remembering the words that the Reaper had said about being able to morph your Heaven Space, you slowly closed your eyes and imagined something that reminded you of home, somewhere that makes you feel like you are yourself, but you had no clue what it was, as your memories are not intact. \n\nThe Reaper held his hands onto both sides of your head gently. "I will assist you, there is no need to worry. Now, close your eyes and imagine any scenery. Maybe it could be a city, or even the mountains, a village, a forest, anything, and let your heart follow it." He whispered softly as he guided your conscience.\n\nYour heart soon followed, and what you saw was...\n\n[[A beach.]]\n[[A forest.]]\n[[A busy city street.]]\n[[Nothing.]]',
  },
  {
    id: 66,
    name: "Start provoking him.",
    content:
      '(set: $annoyed = $annoyed + 1)"Woah there, be careful with your wording, you\'re going to get in trouble if you dare to joke around like that with a Reaper." The Reaper chuckles at your attempt to poke fun at him. He points his scythe at you in an attempt to scare you.\n\n"Does this scare you, o mortal being?" He gave you a threatening glare.\n[["No, it doesn\'t scare me."]]\n[["Yes, it does scare me."]]',
  },
  {
    id: 67,
    name: "That's a bit short...",
    content:
      "\"I know, I know. But it's the necessary time for your soul to assess not being alive and human anymore. Rather, you're just a ghost, a wandering soul now. It's a bit hard to describe, but you'll be alright.\"\n\nYou noticed how the Reaper had been talking to you like you were a lost little child. Should you point that out?\n\n[[\"You can stop treating me like a child now.\"]]\n[[Say nothing.]]",
  },
  {
    id: 68,
    name: "WARNING",
    content:
      "Welcome to Heaven Space. This is a game containing the following topics: Death, Murder, Violence, Gore & Abuse.\n\nThis game is not meant to be for sensitive peple. Please proceed with caution.\n\n[[Proceed.|DAY 1]]",
  },
  {
    id: 69,
    name: "Ask further about Heaven Space.",
    content:
      '"Heaven Space?" The Reaper tilted his head. "Well, haven\'t I told you enough details about it? I suppose curiosity kills the cat." He assures himself before looking you directly in the eye.\n\n"Heaven Space is bascally a culmination of your mindset, your memories, and your past. However, that doesn\'t mean the space is entirely under your control. Its use is to simply provide you with a space that allows you to regain your memories, alongside making you feel at home. However, it will also monitor your behavior, your mindset, and your activities here." He approached you closer, the look in his eye grew even deadlier by the second.\n\nWhether or not you make it out of here is entirely dependent on it."\n\n[[Jesus Christ...]]',
  },
  {
    id: 70,
    name: "Memory 7",
    content:
      "(set: $memory = $memory + 1)You were 17. You had graduated from high school with an honor roll, but your parents were not there at your graduation ceremony to celebrate with you. After all, your mother's passing was a few weeks before this, so you understood why your father would refuse to attend, but it also hurt you as well.\n\nYou were 20. Your father had downed his 9th beer bottle for the night. It had been a few years since your mother's initial passing. He had been yelling curses left and right, while you were trying your best to finish up your assignments right before semester break. The commotion was making you stressed out, and you had enough.\n\nYou entered the living room and politely asked your father to stop drinking and not make so much noise. He wouldn't listen no matter how many times you were patient. In the end, you took the bottles away and placed them back in the fridge. \n\nWhat you didn't know, was that your father was standing right behind you. He slammed the empty beer bottle into your head, and you fell onto the floor. He started to beat you up, wailing your mother's name over and over. You had her features, and he hated to see it.  He needed you gone to reduce the suffering, but only he caused the terror in his life to escalate.\n\nIn the end, you succumbed to your death. \n\n(text-colour:red)[[WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. WAKE UP. |Afterwards 7]]",
  },
  {
    id: 71,
    name: "Afterwards 7",
    content:
      "You snapped your eyes open to see the blankets of the night sky once more. Sweat was all over your body, and a look of fright and terror washed over your face as you got up and catch your breath. Percy, who was snoozing right beside you, woke up in an instant. Just by glancing at you for one second, he could read what had happened in your mind when you were dreaming.\n\nYou witnessed the cause of your death. Your abusive father.\n\nPercy rushed over and gave you gentle rubs on the back, as well as his cloak for you to wipe your tears away from that sudden memory. He knew commenting on it would be detrimental to your emotions, so all he did was comfort you back to your sleep.\n\nIt took a while, but you manage to fall asleep again. You accepted this cause of death, there was nothing you could do anyways, as it is the last day already. This time, Percy is staying up. He had to make sure his soul will not be in harm's way. He had to make sure his soul will not have any regrets or wonders.\n\nHe had to make sure you're okay, by all means, and he swore on the Heavenly System itself.\n\n[[Sleep.|FINAL DAY]] ",
  },
];
