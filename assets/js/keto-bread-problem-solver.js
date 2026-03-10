(function() {
  'use strict';

  var form = document.getElementById('diagnostic-form');
  var resultSection = document.getElementById('diagnosis-result');

  if (!form || !resultSection) {
    return;
  }

  var symptomSelect = document.getElementById('symptom');
  var flourSelect = document.getElementById('flour');
  var binderSelect = document.getElementById('binder');
  var methodSelect = document.getElementById('method');
  var goalSelect = document.getElementById('goal');
  var resetButton = document.getElementById('reset-diagnostic');
  var copyButton = document.getElementById('copy-diagnosis');
  var copyStatus = document.getElementById('copy-status');
  var shortcutButtons = document.querySelectorAll('.tool-shortcut');

  var resultTitle = document.getElementById('result-title');
  var resultConfidence = document.getElementById('result-confidence');
  var resultSummary = document.getElementById('result-summary');
  var resultFixes = document.getElementById('result-fixes');
  var resultRecipe = document.getElementById('result-recipe');
  var resultMeta = document.getElementById('result-meta');
  var resultLinks = document.getElementById('result-links');

  var STORAGE_KEY = 'ketoBreadProblemSolverState';
  var lastDiagnosisText = '';

  var resources = {
    eggy: { title: 'Why Does My Keto Bread Taste Like Egg?', url: '/blog/problem-keto-bread-tastes-like-egg.html' },
    rise: { title: 'How to Make Keto Bread That Actually Rises', url: '/blog/keto-bread-that-actually-rises.html' },
    dense: { title: 'Why Is My Keto Bread Dense?', url: '/blog/why-is-my-keto-bread-dense.html' },
    flat: { title: 'Keto Bread Won\'t Rise', url: '/blog/keto-bread-wont-rise.html' },
    crumbly: { title: 'Crumbly Keto Bread', url: '/blog/crumbly-keto-bread.html' },
    gummy: { title: 'Why Is My Keto Bread Gummy?', url: '/blog/gummy-keto-bread.html' },
    almond: { title: 'Almond Flour Keto Bread Guide', url: '/blog/almond-flour-keto-bread-guide.html' },
    coconut: { title: 'Coconut Flour Keto Bread Guide', url: '/blog/coconut-flour-keto-bread-guide.html' },
    eggfree: { title: 'Keto Bread Without Eggs', url: '/blog/keto-bread-without-eggs.html' },
    bagels: { title: 'Keto Bagels Guide', url: '/blog/keto-bagels-guide.html' },
    rolls: { title: 'Keto Rolls Guide', url: '/blog/keto-rolls-guide.html' },
    machine: { title: 'Keto Bread Machine Guide', url: '/blog/keto-bread-machine-guide.html' },
    toast: { title: 'Keto Toast and Grilled Cheese Guide', url: '/blog/keto-toast-and-grilled-cheese-guide.html' },
    pizza: { title: 'Keto Pizza Crust Guide', url: '/blog/keto-pizza-crust-guide.html' },
    flatbread: { title: 'Keto Flatbread Guide', url: '/blog/keto-flatbread-guide.html' },
    buns: { title: 'Keto Hamburger Buns Guide', url: '/blog/keto-hamburger-buns-guide.html' },
    review: { title: 'Keto Breads Review', url: '/review.html' },
    recipes: { title: 'Best Keto Bread Recipes to Start With', url: '/recipes.html' }
  };

  var symptomProfiles = {
    dense: {
      title: 'Your loaf likely lacked lift and structure',
      summary: 'Dense keto bread usually comes from too much flour packed into too little air, not enough rise support, or a recipe style that cannot support a sandwich-loaf goal.',
      confidence: 80,
      fixes: [
        'Measure flour by weight if possible and avoid packed cups.',
        'Use whipped egg whites or a stronger lift system if you want a lighter sandwich loaf.',
        'Match the recipe style to the goal. Quick breads and microwave breads rarely mimic bakery sandwich bread.'
      ],
      recipe: 'Move toward an almond flour sandwich loaf or a tested loaf recipe with stronger lift rather than improvising a quick-bread formula into a full loaf.',
      links: [resources.dense, resources.rise, resources.almond, resources.recipes]
    },
    eggy: {
      title: 'Your egg ratio is probably too aggressive for the flour base',
      summary: 'Strong egg flavor usually means too many whole eggs, too little balancing flavor, or a center that stayed too wet and custardy during baking.',
      confidence: 82,
      fixes: [
        'Swap some whole eggs for egg whites if the recipe allows it.',
        'Add acid, salt, herbs, or other balancing flavors instead of leaving eggs fully exposed.',
        'Bake longer at a gentler temperature so the center finishes without staying wet.'
      ],
      recipe: 'If your goal is toast or sandwich bread, use a recipe that relies on flour balance and structure instead of asking eggs to do everything.',
      links: [resources.eggy, resources.eggfree, resources.almond]
    },
    flat: {
      title: 'Your bread likely failed on lift, not flavor',
      summary: 'When keto bread stays flat, the usual issue is weak rise mechanics: stale leavening, too much weight for the structure, or a method like bread-machine cycles that works against keto dough.',
      confidence: 79,
      fixes: [
        'Check baking powder or yeast freshness before changing everything else.',
        'Use egg whites, psyllium, or another structure helper if the loaf needs more body.',
        'Use a smaller pan or lower-expectation format if the batter cannot support a tall loaf.'
      ],
      recipe: 'Try a tested rise-focused loaf before retrying the same formula. Keto dough does not behave like wheat dough and needs different expectations.',
      links: [resources.flat, resources.rise, resources.machine, resources.recipes]
    },
    crumbly: {
      title: 'Your loaf probably needed more binder or cooling time',
      summary: 'Crumbly keto bread usually points to weak binding, low moisture, too much coconut flour, or slicing before the loaf finished setting.',
      confidence: 81,
      fixes: [
        'Add or strengthen a binder like psyllium husk, cheese, or more structured eggs depending on the recipe style.',
        'Let the loaf cool fully before slicing so it can finish setting.',
        'If using coconut flour, reduce it slightly or add moisture instead of forcing a dry dough.'
      ],
      recipe: 'Use a recipe specifically designed for sandwich integrity if you plan to slice it thin or toast it.',
      links: [resources.crumbly, resources.coconut, resources.toast, resources.recipes]
    },
    gummy: {
      title: 'The center likely stayed too wet for the loaf format',
      summary: 'Gummy keto bread usually means the loaf was underbaked, too wet in the center, or built with a quick-bread formula that does not scale well to a larger pan.',
      confidence: 78,
      fixes: [
        'Bake longer and confirm the center is fully set before removing it from the oven.',
        'Use a shallower pan or smaller loaf if the batter is very wet.',
        'Cool completely before judging texture because keto bread firms up as steam escapes.'
      ],
      recipe: 'If the goal is a loaf, avoid scaling up a microwave or mug-style recipe. Choose a full-loaf formula instead.',
      links: [resources.gummy, resources.rise, resources.recipes, resources.review]
    },
    dry: {
      title: 'Your flour absorbed more moisture than the recipe could support',
      summary: 'Dry keto bread usually comes from overmeasured flour, especially coconut flour, or from trying to force a lean low-moisture dough into a bread format that needs more fat and structure.',
      confidence: 80,
      fixes: [
        'Reduce flour slightly or measure by weight instead of volume.',
        'Increase moisture with butter, oil, eggs, or another wet ingredient the recipe can support.',
        'Choose a softer bread format if the ingredients are better suited for buns, rolls, or quick bread.'
      ],
      recipe: 'Shift toward a softer roll, bun, or almond-flour loaf if your current formula keeps baking up sandy or dry.',
      links: [resources.coconut, resources.rolls, resources.recipes]
    }
  };

  function getUniqueFixes(list) {
    var seen = {};
    return list.filter(function(item) {
      if (seen[item]) {
        return false;
      }
      seen[item] = true;
      return true;
    });
  }

  function getUniqueLinks(list) {
    var seen = {};
    return list.filter(function(item) {
      if (!item || seen[item.url]) {
        return false;
      }
      seen[item.url] = true;
      return true;
    });
  }

  function getGoalGuide(goal) {
    if (goal === 'buns') {
      return resources.buns;
    }
    if (goal === 'bagels') {
      return resources.bagels;
    }
    if (goal === 'flatbread') {
      return resources.pizza;
    }
    if (goal === 'quick') {
      return resources.recipes;
    }
    return resources.toast;
  }

  function diagnose(values) {
    var profile = symptomProfiles[values.symptom];
    var diagnosis = {
      title: profile.title,
      summary: profile.summary,
      confidence: profile.confidence,
      fixes: profile.fixes.slice(),
      recipe: profile.recipe,
      meta: 'Start with one change at a time so you can isolate what actually improved the loaf.',
      links: profile.links.slice()
    };

    if (values.flour === 'coconut') {
      diagnosis.confidence += 4;
      diagnosis.fixes.push('Treat coconut flour as a high-absorption ingredient. Small measuring errors create big texture swings.');
      diagnosis.links.push(resources.coconut);
      if (values.symptom === 'dry' || values.symptom === 'crumbly') {
        diagnosis.confidence += 3;
      }
    }

    if (values.flour === 'almond') {
      diagnosis.links.push(resources.almond);
      if (values.symptom === 'dense') {
        diagnosis.fixes.push('Use whipped whites or a tested almond flour loaf structure if you want better loft.');
      }
    }

    if (values.flour === 'fathead') {
      diagnosis.fixes.push('Cheese-based dough works best for bagels, buns, and pizza styles. It is rarely the best path to a classic sandwich loaf.');
      diagnosis.links.push(resources.bagels, resources.pizza);
      diagnosis.recipe = 'Lean into fathead-style uses like bagels, buns, or pizza instead of expecting a classic loaf crumb.';
    }

    if (values.binder === 'light' && (values.symptom === 'crumbly' || values.symptom === 'dense')) {
      diagnosis.confidence += 5;
      diagnosis.fixes.push('Your recipe may simply not have enough structure. Add a real binder instead of trying to bake a loose batter into a loaf.');
    }

    if (values.binder === 'eggs' && values.symptom === 'eggy') {
      diagnosis.confidence += 7;
      diagnosis.fixes.push('Whole eggs are likely doing too much heavy lifting. Use a more balanced structure system next time.');
    }

    if (values.binder === 'psyllium') {
      diagnosis.links.push(resources.rise);
      if (values.symptom === 'gummy') {
        diagnosis.fixes.push('Too much psyllium or not enough bake time can leave the loaf tacky.');
      }
    }

    if (values.method === 'breadmachine') {
      diagnosis.confidence += 5;
      diagnosis.meta = 'Bread machines often work against keto dough because the cycles assume gluten development and yeast-style behavior.';
      diagnosis.fixes.push('If you keep getting flat or gummy results, switch to oven baking before rewriting the ingredients.');
      diagnosis.links.push(resources.machine);
    }

    if (values.method === 'microwave') {
      diagnosis.meta = 'Microwave breads are useful for speed, but they are the least reliable route to classic loaf texture.';
      diagnosis.fixes.push('Microwave bread is best treated as quick toast or a one-off sandwich round, not as a benchmark for artisan loaf quality.');
      if (values.symptom === 'gummy' || values.symptom === 'dense') {
        diagnosis.confidence += 4;
      }
    }

    if (values.method === 'airfryer') {
      diagnosis.fixes.push('Countertop ovens and air fryers brown fast. Protect the crust and extend the bake if the center lags behind.');
    }

    if (values.goal === 'sandwich') {
      diagnosis.recipe = 'Prioritize a tested sandwich loaf recipe with better slice strength, even if it takes longer than a quick bread.';
      diagnosis.links.push(resources.toast, resources.almond);
    }

    if (values.goal === 'buns') {
      diagnosis.recipe = 'Buns are usually more forgiving than a tall loaf. Use that to your advantage if sandwich bread keeps failing.';
      diagnosis.links.push(resources.buns, resources.rolls);
    }

    if (values.goal === 'bagels') {
      diagnosis.recipe = 'Bagels need chew and shape retention, not open crumb. Favor a bagel-specific formula over a generic loaf recipe.';
      diagnosis.links.push(resources.bagels);
    }

    if (values.goal === 'flatbread') {
      diagnosis.recipe = 'Flatbreads and pizza crusts reward flexible dough and crisp edges more than airy rise. Use a dedicated flatbread formula.';
      diagnosis.links.push(resources.flatbread, resources.pizza);
    }

    if (values.goal === 'quick') {
      diagnosis.recipe = 'For quick breads, optimize for speed and acceptable texture rather than expecting bakery-style sandwich slices.';
      diagnosis.links.push(resources.recipes);
    }

    diagnosis.links.push(getGoalGuide(values.goal), resources.review);
    diagnosis.links = getUniqueLinks(diagnosis.links);
    diagnosis.fixes = getUniqueFixes(diagnosis.fixes).slice(0, 5);
    diagnosis.confidence = Math.max(72, Math.min(diagnosis.confidence, 94));

    return diagnosis;
  }

  function renderDiagnosis(diagnosis) {
    resultTitle.textContent = diagnosis.title;
    resultConfidence.textContent = diagnosis.confidence + '%';
    resultSummary.textContent = diagnosis.summary;
    resultRecipe.textContent = diagnosis.recipe;
    resultMeta.textContent = diagnosis.meta;

    resultFixes.innerHTML = '';
    diagnosis.fixes.forEach(function(fix) {
      var item = document.createElement('li');
      item.textContent = fix;
      resultFixes.appendChild(item);
    });

    resultLinks.innerHTML = '';
    diagnosis.links.slice(0, 4).forEach(function(link) {
      var anchor = document.createElement('a');
      anchor.className = 'diagnosis-link';
      anchor.href = link.url;
      anchor.textContent = link.title;
      resultLinks.appendChild(anchor);
    });

    lastDiagnosisText = [
      diagnosis.title,
      'Confidence: ' + diagnosis.confidence + '%',
      diagnosis.summary,
      'Next batch fixes: ' + diagnosis.fixes.join(' | '),
      'Recipe direction: ' + diagnosis.recipe
    ].join('\n');

    resultSection.hidden = false;
    if (resultSection.scrollIntoView) {
      resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function saveState() {
    if (!window.localStorage) {
      return;
    }

    var data = {
      symptom: symptomSelect.value,
      flour: flourSelect.value,
      binder: binderSelect.value,
      method: methodSelect.value,
      goal: goalSelect.value
    };

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      return;
    }
  }

  function restoreState() {
    if (!window.localStorage) {
      return;
    }

    var raw;
    try {
      raw = window.localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      return;
    }

    if (!raw) {
      return;
    }

    try {
      var data = JSON.parse(raw);
      symptomSelect.value = data.symptom || '';
      flourSelect.value = data.flour || 'unknown';
      binderSelect.value = data.binder || 'unknown';
      methodSelect.value = data.method || 'oven';
      goalSelect.value = data.goal || 'sandwich';
    } catch (error) {
      return;
    }
  }

  function resetForm() {
    form.reset();
    symptomSelect.value = '';
    flourSelect.value = 'unknown';
    binderSelect.value = 'unknown';
    methodSelect.value = 'oven';
    goalSelect.value = 'sandwich';
    resultSection.hidden = true;
    copyStatus.textContent = '';
    lastDiagnosisText = '';
    if (window.localStorage) {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        return;
      }
    }
  }

  shortcutButtons.forEach(function(button) {
    button.addEventListener('click', function() {
      symptomSelect.value = button.getAttribute('data-symptom');
      symptomSelect.focus();
      saveState();
    });
  });

  form.addEventListener('submit', function(event) {
    event.preventDefault();

    if (!symptomSelect.value) {
      symptomSelect.focus();
      return;
    }

    var values = {
      symptom: symptomSelect.value,
      flour: flourSelect.value,
      binder: binderSelect.value,
      method: methodSelect.value,
      goal: goalSelect.value
    };

    saveState();
    renderDiagnosis(diagnose(values));
  });

  form.addEventListener('change', saveState);

  resetButton.addEventListener('click', resetForm);

  copyButton.addEventListener('click', function() {
    if (!lastDiagnosisText) {
      return;
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(lastDiagnosisText).then(function() {
        copyStatus.textContent = 'Diagnosis copied.';
      }, function() {
        copyStatus.textContent = 'Copy failed. You can select the text manually.';
      });
      return;
    }

    copyStatus.textContent = 'Copy is not supported in this browser.';
  });

  restoreState();
})();