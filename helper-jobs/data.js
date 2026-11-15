(function (root) {
  const jobs = [
    { id: 'snack', name: 'Snack Helper', level: 1, icon: 'apple', desc: 'Hand out snacks next to a volunteer.', steps: [['hand-sanitizer', 'Clean your hands', 'Use wipes or gel. Put on gloves.'], ['zoom-check', 'Check the snack card', 'Snack okay, or no snack. Ask the volunteer.'], ['apple', 'Give one snack', 'Say the kid’s name. Offer a napkin and water.'], ['star', 'You did it', 'Tap Done when you arrive.']] },
    { id: 'walk', name: 'Walk Leader', level: 1, icon: 'walk', desc: 'Help the group move safely.', steps: [['flag', 'Hold the group sign', 'Walk slowly at the front or back.'], ['eye', 'Look back', 'Check that everyone is keeping up.'], ['traffic-lights', 'Stop at roads', 'Wait for the volunteer to say go.'], ['star', 'You did it', 'Tell the volunteer if someone stops.']] },
    { id: 'cleanup', name: 'Clean-Up Crew', level: 1, icon: 'basket', desc: 'Pack up after the outing.', steps: [['trash', 'Pick up trash', 'Put it in the bin.'], ['backpack', 'Pack the toys', 'Put balls and bubbles in the bag.'], ['checklist', 'Check the list', 'Balls, bubbles, mats, snack box.'], ['star', 'You did it', 'Tap Done when everything is ready.']] },
    { id: 'play', name: 'Play Partner', level: 2, icon: 'puzzle', desc: 'Do one activity together.', steps: [['puzzle', 'Pick an activity', 'Choose bubbles, a ball, or blocks.'], ['message-circle', 'Ask “Want to play?”', 'If they say no, that is okay.'], ['users', 'Take turns', 'Say “my turn, your turn.”'], ['star', 'You did it', 'Stop if the kid looks tired.']] },
    { id: 'talk', name: 'Talk Friend', level: 2, icon: 'message-circle', desc: 'Have a short, friendly chat.', steps: [['eye', 'Sit at eye level', 'Say one card at a time.'], ['hourglass', 'Wait your turn', 'A word, point, nod, device, or smile all count.'], ['ear', 'Listen back', 'Do not finish the kid’s sentence.'], ['star', 'You did it', 'Tap Done when you are ready.']] },
    { id: 'buddy', name: 'Buddy', level: 3, icon: 'heart-handshake', desc: 'Stay with one kid for the outing.', steps: [['mood-happy', 'Say hi', 'Use the kid’s name.'], ['users', 'Stay close', 'About one arm away, with a volunteer nearby.'], ['hand-stop', 'If something happens', 'Do not chase. Stay calm and press Help.'], ['star', 'Say bye', 'Tell the volunteer and tap Done.']] }
  ];

  const specSteps = {
    buddy: [['mood-happy', 'Say hi', 'Use the kid’s name.'], ['cards', 'Read the tip card', 'Holds hands on stairs. Scared of dogs.'], ['users', 'Stay close', 'About one arm away, with a volunteer nearby.'], ['traffic-lights', 'Hold hands to cross', 'Ask the volunteer before moving.'], ['eye', 'Check back', 'Make sure your kid is with you.'], ['hand-stop', 'If they run off', 'Do not chase. Stay calm and press Help.'], ['toilet-paper-off', 'Bathroom help', 'Tell the volunteer. Never take the kid yourself.'], ['star', 'Say bye', 'Tell the volunteer and tap Done.']],
    play: [['puzzle', 'Pick an activity', 'Bubbles, ball, swing, coloring, blocks, or a song.'], ['message-circle', 'Ask “Want to play?”', 'If they say no or walk away, that is okay.'], ['users', 'Take turns', 'Say “my turn, your turn.”'], ['thumb-up', 'Cheer them on', 'Nice throw! A high five is okay.'], ['player-stop', 'Stop if tired', 'Stop when the kid looks tired or upset.'], ['star', 'Tap Done', 'Pick a smiley for how it went.']],
    talk: [['eye', 'Sit at eye level', 'Crouch or sit near the kid.'], ['cards', 'Say one card', 'Hi, I’m ___. What is your favorite color?'], ['hourglass', 'Wait 10 seconds', 'Take your time. Any answer counts.'], ['ear', 'Listen back', 'A word, point, nod, device, or smile counts.'], ['message-2', 'Say it back', 'Blue! I like blue too.'], ['volume-3', 'Do not talk over', 'Do not finish the kid’s sentence.'], ['star', 'Tap Done', 'You did it.']],
    snack: [['hand-sanitizer', 'Clean your hands', 'Use wipes or gel.'], ['hand-grab', 'Put on gloves', 'Ask the volunteer if you need help.'], ['zoom-check', 'Check the snack card', 'Snack okay, or no snack. Never guess.'], ['apple', 'Give one snack', 'Say the kid’s name.'], ['help-circle', 'If unsure, ask', 'The volunteer decides.'], ['droplet', 'Offer water', 'Offer a napkin too.'], ['star', 'Tap Done', 'Tell the volunteer you finished.']],
    walk: [['flag', 'Hold the group sign', 'Walk at the front or back with a volunteer.'], ['eye', 'Look back', 'Check that kids are keeping up.'], ['traffic-lights', 'Stop at roads', 'Wait for the volunteer to say go.'], ['speakerphone', 'Tell the volunteer', 'Speak up if a kid stops or falls behind.'], ['star', 'Tap Done', 'Tell the volunteer when you arrive.']],
    cleanup: [['trash', 'Pick up trash', 'Put it in the bin.'], ['backpack', 'Pack the toys', 'Put balls and bubbles in the bag.'], ['checklist', 'Check the list', 'Balls, bubbles, mats, snack box.'], ['star', 'Tap Done', 'Tell the volunteer everything is ready.']]
  };
  jobs.forEach(job => { job.steps = specSteps[job.id]; job.needsVolunteer = ['snack', 'walk', 'play', 'talk', 'buddy'].includes(job.id); });

  const fixtures = {
    outing: { id: 'outing-sunday', title: 'Sunday at Pragnya Park', place: 'Pragnya Park', date: '2026-10-25', status: 'live', leadVolunteer: 'Jordan', presentHelpers: [], presentKids: [], scheduleNow: 0,
      schedule: [
        { id: 'arrive', icon: 'map-pin', label: 'Arrive and say hi', time: '10:00' },
        { id: 'walk', icon: 'walk', label: 'Walk to the park', time: '10:15' },
        { id: 'play', icon: 'puzzle', label: 'Play time', time: '10:45' },
        { id: 'snack', icon: 'apple', label: 'Snack time', time: '11:30' },
        { id: 'cleanup', icon: 'basket', label: 'Clean up', time: '12:00' },
        { id: 'home', icon: 'home', label: 'Go home', time: '12:30' }
      ] },
    helpers: [
      { id: 'helper-asha', name: 'Asha', photo: 'A', level: 1, consent: true, voiceEnabled: true, language: 'en', unlockedJobs: ['snack', 'walk', 'cleanup'], stars: 2 },
      { id: 'helper-ravi', name: 'Ravi', photo: 'R', level: 1, consent: true, voiceEnabled: true, language: 'en', unlockedJobs: ['snack', 'walk', 'cleanup'], stars: 1 },
      { id: 'helper-mina', name: 'Mina', photo: 'M', level: 1, consent: true, voiceEnabled: true, language: 'en', unlockedJobs: ['snack', 'walk', 'cleanup'], stars: 0 }
    ],
    kids: [
      { id: 'kid-eli', firstName: 'Eli', photo: 'E', safeTips: ['Ask before touching', 'Quiet voice helps', 'Offer two choices'], allergy: 'none', snackAllowed: true, snackAllowList: ['fruit', 'water'], snackDenyList: ['nuts'], parentConsent: true, consent: true },
      { id: 'kid-noor', firstName: 'Noor', photo: 'N', safeTips: ['Show the picture first', 'Give extra time', 'Water is okay'], allergy: 'peanut', snackAllowed: false, snackAllowList: ['water'], snackDenyList: ['all snacks'], parentConsent: true, consent: true },
      { id: 'kid-sam', firstName: 'Sam', photo: 'S', safeTips: ['Stay near the bench', 'Pointing is communication', 'Check in gently'], allergy: 'none', snackAllowed: true, snackAllowList: ['fruit', 'water'], snackDenyList: ['nuts'], parentConsent: true, consent: true }
    ],
    volunteers: [
      { id: 'vol-jordan', name: 'Jordan', nearby: true },
      { id: 'vol-kai', name: 'Kai', nearby: true }
    ]
  };

  // Pictures the lead can pick for the day plan.
  const scheduleIcons = ['map-pin', 'walk', 'puzzle', 'apple', 'basket', 'home', 'users', 'sun', 'coffee', 'star', 'flag', 'bubble'];
  root.HelperJobsData = { jobs, fixtures, scheduleIcons };
  if (typeof module !== 'undefined') module.exports = { jobs, fixtures, scheduleIcons };
})(typeof window !== 'undefined' ? window : globalThis);
