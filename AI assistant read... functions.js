// Read todo resp fn
function readTodoResp(value, operation) {
  const matchNames = matchAllItems(value, '', 'names');

  let allNamesArr = [...new Set(parseValues(matchNames.replace(/names?\s*(:+|=+)\s*/i, '').split(/\s*,\s*/)))]
    .filter(n => !allTodosObj[n])
    .slice(0, allBlockLimitsObj.todos - Object.keys(allTodosObj).length);

  // Add
  if(allAddingOp.includes(operation)) {
    let allTagsArr = parseValues(matchAllItems(value, 'todo', 'tags'));
    if(!matchNames || !allTagsArr.join('')) {
      createAssistantResponse(`I can't find the ${!matchNames ? 'names' : 'tags'}. Please specify the ${!matchNames ? 'names' : 'tags'}: ...`);
      return setPreInnerHTMLRegexp(`${!matchNames ? 'names' : 'tags'}`);
    };

    let originalMarksArr = matchAllItems(value, 'todo', 'marks')
    let allMarksArr = originalMarksArr.length ? parseValues(originalMarksArr) : [];

    // Check names length
    if(!allNamesArr.length) {
      createAssistantResponse('All the specified names are already in use.');
      return setPreInnerHTMLRegexp("are already in use.");
    };
    const respText = checkValuesLength(allNamesArr, 'todos', 'todoName');
    if(respText) {
      createAssistantResponse(respText);
      allNamesArr = allNamesArr.slice(0, 9);
      allNamesArr = allNamesArr.map(n => n.slice(0, allValuesLimit.todoName))
    };

    const allNamesLng = allNamesArr.length;

    // Check tags length
    const respText2 = checkValuesLength(allTagsArr, 'tags', 'todoTag');
    if(respText2) {
      createAssistantResponse(respText2);
      allTagsArr = allTagsArr.slice(0, 9);
      allTagsArr = allTagsArr.map(n => n.slice(0, allValuesLimit.todoTag));
    }

    const allTagsLng = allTagsArr.length;
    if(!allTagsLng) {
      createAssistantResponse("You forgot to specify tags or wrote the command incorrectly, I can't create a to-do without tags.");
      return setPreInnerHTMLRegexp("I can't create a to-do without tags.");
    };

    if(allTagsLng < allNamesLng && allTagsLng !== 1) {
      createAssistantResponse(`You listed ${allNamesLng} names, but you only have ${allTagsLng} tags.\nPlease provide ${allNamesLng - allTagsLng} more tags, and in the correct order so I can properly assign them to your to-do.`);
      return setPreInnerHTMLRegexp('names', 'tags', 'in the correct order');
    }

    // Check marks length
    const respText3 = checkValuesLength(allMarksArr, 'marks', 'todoMark');
    if(respText3) {
      createAssistantResponse(respText3);
      allMarksArr = allMarksArr.slice(0, 9);
      allMarksArr = allMarksArr.map(n => n.slice(0, allValuesLimit.todoMark));
    }

    const allMarksLng = allMarksArr.length > 9 ? 9 : allMarksArr.length;
    if(allMarksLng < allNamesLng && allMarksLng > 1) {
      createAssistantResponse(`You listed ${allNamesLng} names, but you only have ${allMarksLng} marks.\nPlease provide ${allNamesLng - allMarksLng} more marks, and in the correct order so I can properly assign them to your to-do.`);
      return setPreInnerHTMLRegexp('names', 'marks', 'in the correct order');
    }

    // Do operation
    const allTagsForAdd = allTagsLng === allNamesLng ? allTagsArr : new Array(allNamesLng).fill(allTagsArr[0]);
    const allMarksForAdd = allMarksLng === allNamesLng ? allMarksArr : new Array(allNamesLng).fill(allMarksArr[0] || '');

    const d = new Date();
    const date = d.getDate(),
    month = d.getMonth(),
    year = d.getFullYear();
    const time = `${String(date).padStart(2, '0')}:${String(month + 1).padStart(2, '0')}:${year}`;

    for(let i = 0; i < allNamesLng; i++) {
      allTodosObj[allNamesArr[i]] = {tag: allTagsForAdd[i], mark: allMarksForAdd[i], date: time, isCompleted: false};
    }
    const btn = createAssistantResponse(`All your to-dos (${allNamesArr.join(', ')}) have been successfully added.`, true);
    initShowAddedInType('todo', btn, allNamesArr);
    setPreInnerHTMLRegexp('have been successfully added.');
    setOpenBtnsTexts();
    initGroupsTodosObj();

    // Set unsaved todo
    todoSaveBtn.classList.add('unsaved');
  }

  // Delete
  else if(allDeletingOp.includes(operation)) {
    if(!matchNames) {
      createAssistantResponse("I can't find the names. Please specify the names: ...");
      return setPreInnerHTMLRegexp('names');
    }
    const allNamesForDeleteOp = [ ...new Set( parseValues( matchNames.replace(/names? *: */i, '').split(/\s*,\s*/) ) ) ];
    const allDeleteNames = [];
    const notFoundTodoNames = [];

    const deletedTodosForUndo = {};

    for(let n of allNamesForDeleteOp) {
      if(n in allTodosObj) {
        deletedTodosForUndo[n] = allTodosObj[n];
        delete allTodosObj[n]
        allDeleteNames.push(n);
      }
      else notFoundTodoNames.push(n);
    }

    if(!allDeleteNames.length && notFoundTodoNames.length) {
      createAssistantResponse(`It seems you wanted to delete these to-dos: "${notFoundTodoNames.join(', ')}",\nBut unfortunately I couldn't find them.\nPlease check if these to-dos exist.`);
      return setPreInnerHTMLRegexp("I couldn't find them");
    }
    else if(!allDeleteNames.length) return createAssistantResponse("You did not specify the names of the to-do items for deletion or specified them incorrectly.\nPlease review your command.");

    setOpenBtnsTexts();
    initGroupsTodosObj();

    if(notFoundTodoNames.length) {
      const btn = createAssistantResponse(`I couldn't find these to-dos: "${notFoundTodoNames.join(', ')}", but successfully deleted these: ${allDeleteNames.join(', ')}.`, true);
      initUndoBtn('todo', btn, 'delete');
      setPreInnerHTMLRegexp("I couldn't find these to-dos:", 'successfully deleted these:');
    }
    else {
      const btn = createAssistantResponse(`All your to-dos (${allDeleteNames.join(', ')}) have been successfully deleted.`, true);
      initUndoBtn('todo', btn, 'delete');
      setPreInnerHTMLRegexp("have been successfully deleted.");
    };

    savedDataForUndo.todo = deletedTodosForUndo;

    setOpenBtnsTexts();
    // Set unsaved todo
    todoSaveBtn.classList.add('unsaved');
  }

  // Search
  else if(allSearchingOp.includes(operation)) {
    value = value.toLowerCase();
    const allKeys = value.includes('key') ? matchAllItems(value, '', 'keys') : [''];
    const allNames = value.includes('name') ? matchAllItems(value, '', 'names').replace(/names?\s*(:+|=+)\s*/i).split(/\s*,\s*/) : [''];
    const allMarks = value.includes('mark') ? matchAllItems(value, 'todo', 'marks') : [''];
    const allTags = value.includes('tag') ? matchAllItems(value, 'todo', 'tags') : [''];

    assistantBlockForShowBlocks.textContent = '';
    const frag = document.createDocumentFragment();

    if(allKeys.join('').trim()) {
      for(let n in allTodosObj) {
        for(let k of allKeys) {
          if(n.toLowerCase().includes(k.toLowerCase()) || allTodosObj[n].date.includes(k) || allTodosObj[n].mark.toLowerCase().includes(k.toLowerCase())) {
            frag.appendChild(createBlockForAssistantShow(n, 'todo', k));
            break;
          }
        }
      }
    }
    else if(allNames.join('').trim()) {
      for(let n in allTodosObj) {
        for(let k of allNames) {
          if(n.toLowerCase().includes(k.toLowerCase())) {
            frag.appendChild(createBlockForAssistantShow(n, 'todo', k));
            break;
          }
        }
      }
    }
    else if(allMarks.join('').trim()) {
      for(let n in allTodosObj) {
        for(let k of allMarks) {
          const mark = allTodosObj[n].mark.toLowerCase();
          if(mark && mark.includes(k.toLowerCase())) {
            frag.appendChild(createBlockForAssistantShow(n, 'todo', k));
            break;
          }
        }
      }
    }
    else if(allTags.join('').trim()) {
      for(let n in allTodosObj) {
        for(let k of allTags) {
          const tag = allTodosObj[n].tag.toLowerCase();
          if(tag && tag.includes(k.toLowerCase())) {
            frag.appendChild(createBlockForAssistantShow(n, 'todo'));
            break;
          }
        }
      }
    }
    else return useAiResp(value);

    frag.appendChild(createAssistantShowBlokCloseBtn());
    if(frag.childElementCount > 1) {
      assistantBlockForShowBlocks.appendChild(frag);
      assistantBlockForShowBlocks.classList.add('open');
    }
    else return createAssistantResponse("Nothing found.");
  }

  // Clear
  else if(allClearingOp.includes(operation)) {
    savedDataForUndo.todo = allTodosObj;
    allTodosObj = {};
    const btn = createAssistantResponse('All your to-dos have been deleted.', true);
    initUndoBtn('todo', btn, 'clear');

    setPreInnerHTMLRegexp('have been deleted.');
    setOpenBtnsTexts();
    initGroupsTodosObj();
    todoSaveBtn.classList.add('unsaved');
  }

  // Save
  else if(allSavingOp.includes(operation)) todoSaveBtn.click();

  // Showing/list
  else if(allShowingOp.includes(operation)) {
    let totalResponseText = '';
    const allWordsForHeightLight = [];

    const allTodosArr = Object.keys(allTodosObj);
    const allTodosLng = allTodosArr.length;
    if(!allTodosLng) return createAssistantResponse("You don't have a to-do.");

    if(value.toLowerCase().includes('name')) {
      totalResponseText = `Total names found: ${allTodosLng}\n`;
      for(let n in allTodosObj) {
        totalResponseText += `- ${n}\n`;
        allWordsForHeightLight.push(`- ${n}`);
      };
      createAssistantResponse(totalResponseText);
      setPreInnerHTMLRegexp(...allWordsForHeightLight);
    }
    else if(value.toLowerCase().includes('mark')) {
      const allMarks = [...new Set(allTodosArr.map(n => allTodosObj[n].mark))].filter(m => m);
      if(!allMarks.length) return createAssistantResponse("You don't have a marks");

      totalResponseText = `Total marks found: ${allMarks.length}\n`;
      for(let m of allMarks) {
        totalResponseText += `- ${m}\n`;
        allWordsForHeightLight.push(`- ${m}`);
      }
      createAssistantResponse(totalResponseText);
      setPreInnerHTMLRegexp(...allWordsForHeightLight);
    }
    else if(value.toLowerCase().includes('tag')) {
      const allTags = [...new Set(allTodosArr.map(n => allTodosObj[n].tag))];
      totalResponseText = `Total names found: ${allTags.length}\n`;
      for(let t of allTags) {
        totalResponseText += `- ${t}\n`;
        allWordsForHeightLight.push(`- ${t}`);
      };
      createAssistantResponse(totalResponseText);
      setPreInnerHTMLRegexp(...allWordsForHeightLight);
    }

    else {
      assistantBlockForShowBlocks.textContent = '';
      const frag = document.createDocumentFragment();

      for(let n in allTodosObj) frag.appendChild(createBlockForAssistantShow(n, 'todo'));

      frag.appendChild(createAssistantShowBlokCloseBtn());
      assistantBlockForShowBlocks.appendChild(frag);

      assistantBlockForShowBlocks.classList.add('open');
    }
  }

  // Read/info
  else if(allReadingOp.includes(operation)) {
    if(!matchNames) {
      // All todos lng
      const allTodosLng = Object.keys(allTodosObj).length;

      // All completed todos lng
      let completedTodosLng = 0;
      // Favorites todos lng
      let favoritesTodosLng = 0;
      // The most todos dates info
      const allTodosDates = {};

      for(let n in allTodosObj) {
        if(allTodosObj[n].isFav) favoritesTodosLng++;
        allTodosDates[allTodosObj[n].date] = (allTodosDates[allTodosObj[n].date] || 0) + 1;
        if(allTodosObj[n].isCompleted) completedTodosLng++;
      }

      const mostTodosDatesNum = Math.max(Math.max(...Object.values(allTodosDates)), 0);
      const todosMostDates = Object.keys(allTodosDates).find(n => allTodosDates[n] === mostTodosDatesNum) || 'None';

      // Show todos info
      createAssistantResponse(`-Total todos: ${allTodosLng}\n-Completed todos: ${completedTodosLng}\n-Most of your todos have this date: ${todosMostDates}, this is the number of todos: ${mostTodosDatesNum}\n-Total pinned(favorite) todos you have: ${favoritesTodosLng}.`);
      setPreInnerHTMLRegexp('-Total todos:', '-Completed todos:', '-Most of your todos have this date:', '-Total pinned(favorite) todos you have:');
    }
    else {
      allNamesArr = [...new Set(matchNames.replace(/names? *: */i, '').split(/, */))];
      let totalResponseText = '';

      for(let n of allNamesArr) {
        const val = n.toLowerCase();

        for(let todo in allTodosObj) {
          const todoLower = todo.toLowerCase();
          if(todoLower.includes(val) || val.includes(todoLower)) {
            const date = allTodosObj[todo].date;
            const isCompleted = allTodosObj[todo].isCompleted;
            const todoTag = allTodosObj[todo].tag;
            const todoMark = allTodosObj[todo].mark || 'None';
            const isFavorite = allTodosObj[todo].isFav || 'false';

            totalResponseText += `-Name: ${todo}\n-Done: ${isCompleted}\n-Favorite: ${isFavorite}\n-Date: ${date}\n-Tag: ${todoTag}\n-Mark: ${todoMark}`;
            totalResponseText += '\n-------------------------------\n';
          }
        }
      }

      createAssistantResponse(totalResponseText || `I couldn't find any todos for the specified ${allNamesArr.length > 1 ? 'names' : 'name'}: ${allNamesArr.join(', ')}`);
      setPreInnerHTMLRegexp('-Name:', '-Done:', '-Favorite:', '-Date:', '-Tag:', '-Mark:');
    }
  }

  // Open
  else if(allOpeningOp.includes(operation)) {
    assistantWrap.classList.remove('show');
    todoWrap.classList.add('show');
  }

  else return createAssistantResponse("Sorry, I didn't understand your command. Could you please clarify it once again?");

  assistantTypeMemory = 'todos';
  assistantMemoryTxtInfo.textContent = 'Last used: todos';
}

// Read note resp fn
function readNoteResp(value, operation) {
  const matchNames = matchAllItems(value, '', 'names');

  let allNamesArr = [...new Set(parseValues(matchNames.replace(/names?\s*(:+|=+)\s*/i, '').split(/\s*,\s*/)))]
    .filter(n => !allNotesObj[n])
    .slice(0, allBlockLimitsObj.notes - Object.keys(allNotesObj).length);

  // Add
  if(allAddingOp.includes(operation)) {
    if(!matchNames) {
      createAssistantResponse("I can't find the names. Please specify the names: ...");
      return setPreInnerHTMLRegexp('names');
    };

    // Check names length
    const respText1 = checkValuesLength(allNamesArr, 'notes');
    if(respText1) {
      createAssistantResponse(respText1);
      allNamesArr = allNamesArr.slice(0, 9);
    }
    const allNamesLng = allNamesArr.length;

    let allDescriptionArr = value.includes('desc') ? parseValues(matchAllItems(value, 'note', 'desc')) : [''];
    // Check description length
    const respText2 = checkValuesLength(allDescriptionArr, 'descriptions');
    if(respText2) {
      createAssistantResponse(respText2);
      allDescriptionArr = allDescriptionArr.slice(0, 9);
    }

    const allDescriptionLng = allDescriptionArr.length;
    if(allDescriptionLng < allNamesLng && allDescriptionLng > 1) {
      createAssistantResponse(`You listed ${allNamesLng} names, but you only have ${allDescriptionLng} descriptions.\nPlease provide ${allNamesLng - allDescriptionLng} more descriptions, and in the correct order so I can properly assign them to your notes.`)
      return setPreInnerHTMLRegexp('names', 'descriptions', 'in the correct order');
    }

    const allDescriptionsForAdd = allDescriptionLng === allNamesLng ? allDescriptionArr : new Array(allNamesLng).fill(allDescriptionArr[0]);

    for(let i = 0; i < allNamesLng; i++) {
      allNotesObj[allNamesArr[i]] = {description: allDescriptionsForAdd[i], txt: ''};
    }
    const btn = createAssistantResponse(`All your notes (${allNamesArr.join(', ')}) have been successfully added.`, true);
    initShowAddedInType('note', btn, allNamesArr);
    setPreInnerHTMLRegexp('have been successfully added.');
    setOpenBtnsTexts();

    // Set note unsaved
    noteSaveBtn.classList.add('unsaved');
  }

  // Delete
  else if(allDeletingOp.includes(operation)) {
    if(!matchNames) {
      createAssistantResponse("I can't find the names. Please specify the names: ...");
      return setPreInnerHTMLRegexp('names');
    }
    const allNamesForDeleteOp = [ ...new Set( parseValues( matchNames.replace(/names? *: */i, '').split(/\s*,\s*/) ) ) ];

    const allDeleteNames = [];
    const notFoundNames = [];

    const deletedNotesForUndo = {};

    for(let n of allNamesForDeleteOp) {
      if(allNotesObj[n]) {
        deletedNotesForUndo[n] = allNotesObj[n];
        delete allNotesObj[n];
        allDeleteNames.push(n);
      }
      else notFoundNames.push(n);
    }

    if(!allDeleteNames.length && notFoundNames.length) {
      createAssistantResponse(`It seems you wanted to delete these notes: "${notFoundNames.join(', ')}",\nBut unfortunately I couldn't find them.\nPlease check if these notes exist.`);
      return setPreInnerHTMLRegexp("I couldn't find them");
    }
    else if(!allDeleteNames.length) {
      createAssistantResponse("You did not specify the names of the notes items for deletion or specified them incorrectly.\nPlease review your command.");
      return setPreInnerHTMLRegexp('Please review your command.');
    };

    if(notFoundNames.length) {
      const btn = createAssistantResponse(`I couldn't find these notes: "${notFoundNames.join(', ')}", but successfully deleted these: ${allDeleteNames.join(', ')}.`, true);
      initUndoBtn('note', btn, 'delete');
      setPreInnerHTMLRegexp("I couldn't find these notes:", 'successfully deleted these:');
    }
    else {
      const btn = createAssistantResponse(`All your notes (${allDeleteNames.join(', ')}) have been successfully deleted.`, true);
      initUndoBtn('note', btn, 'delete');
      setPreInnerHTMLRegexp("have been successfully deleted.");
    };

    savedDataForUndo.note = deletedNotesForUndo;

    setOpenBtnsTexts();
    // Set unsaved note
    noteSaveBtn.classList.add('unsaved');
  }

  // Search
  else if(allSearchingOp.includes(operation)) {
    value = value.toLowerCase();
    const allKeys = value.includes('key') ? matchAllItems(value, '', 'keys') : [''];
    const allNames = value.includes('name') ? matchAllItems(value, '', 'names').replace(/names?\s*(:+|=+)\s*/i).split(/\s*,\s*/) : [''];
    const allDesc = value.includes('desc') ? matchAllItems(value, 'note', 'desc') : [''];

    assistantBlockForShowBlocks.textContent = '';
    const frag = document.createDocumentFragment();

    if(allKeys.join('').trim()) {
      for(let n in allNotesObj) {
        for(let k of allKeys) {
          if(n.toLowerCase().includes(k.toLowerCase()) || allNotesObj[n].description.toLowerCase().includes(k.toLowerCase())) {
            frag.appendChild(createBlockForAssistantShow(n, 'note', k));
            break;
          }
        }
      }
    }
    else if(allNames.join('').trim()) {
      for(let n in allNotesObj) {
        for(let k of allNames) {
          if(n.toLowerCase().includes(k.toLowerCase())) {
            frag.appendChild(createBlockForAssistantShow(n, 'note', k));
            break;
          }
        }
      }
    }
    else if(allDesc.join('').trim()) {
      for(let n in allNotesObj) {
        for(let k of allDesc) {
          let desc = allNotesObj[n].description.toLowerCase().trim();
          if(desc.includes(k.toLowerCase()) && desc !== 'description') {
            console.log('1');
            frag.appendChild(createBlockForAssistantShow(n, 'note', k));
            break;
          }
        }
      }
    }
    else return useAiResp(value);

    frag.appendChild(createAssistantShowBlokCloseBtn());
    if(frag.childElementCount > 1) {
      assistantBlockForShowBlocks.appendChild(frag);
      assistantBlockForShowBlocks.classList.add('open');
    }
    else return createAssistantResponse("Nothing found.");
  }

  // Clear
  else if(allClearingOp.includes(operation)) {
    savedDataForUndo.note = allNotesObj;
    allNotesObj = {};
    const btn = createAssistantResponse('All your notes have been deleted.', true);
    initUndoBtn('note', btn, 'clear');
    setPreInnerHTMLRegexp('have been deleted.');
    setOpenBtnsTexts();
    noteSaveBtn.classList.add('unsaved');
  }

  // Save
  else if(allSavingOp.includes(operation)) noteSaveBtn.click();

  // Showing/list
  else if(allShowingOp.includes(operation)) {
    let totalResponseText = '';
    const allWordsForHeightLight = [];

    const allNotesArr = Object.keys(allNotesObj);
    const allNotesLng = allNotesArr.length;

    if(value.includes('name')) {
      totalResponseText = `Total names found: ${allNotesLng}\n`;
      for(let n of allNotesArr) {
        totalResponseText += `- ${n}\n`;
        allWordsForHeightLight.push(`- ${n}`);
      }
      createAssistantResponse(totalResponseText);
      setPreInnerHTMLRegexp(...allWordsForHeightLight);
    }
    else if(value.includes('desc')) {
      const allDescs = allNotesArr.map(n => allNotesObj[n].description).filter(d => d && d !== 'Description');
      if(!allDescs.length) return createAssistantResponse("You don't have a descriptions");

      totalResponseText = `Total descriptions found: ${allDescs.length}\n`;
      for(let d of allDescs) {
        totalResponseText += `- ${d}\n`;
        allWordsForHeightLight.push(`- ${d}`);
      }
      createAssistantResponse(totalResponseText);
      setPreInnerHTMLRegexp(...allWordsForHeightLight);
    }

    else {
      assistantBlockForShowBlocks.textContent = '';
      const frag = document.createDocumentFragment();

      for(let n in allNotesObj) frag.appendChild(createBlockForAssistantShow(n, 'note'));

      frag.appendChild(createAssistantShowBlokCloseBtn());
      assistantBlockForShowBlocks.appendChild(frag);

      assistantBlockForShowBlocks.classList.add('open');
    }
  }

  // Read/info
  else if(allReadingOp.includes(operation)) {
    if(!matchNames) {
      const allNotesArr = Object.keys(allNotesObj);
      // All notes lng
      const allNotesLng = allNotesArr.length;

      // All notes symbols lng
      const allNotesSymbolsLng = allNotesArr.reduce((sum, n) => sum + allNotesObj[n].txt.replaceAll('\n', '').length, 0);

      // All description length
      const allNotesDescSymbolsLng = allNotesArr.reduce((sum, n) => sum + allNotesObj[n].description.length, 0);

      // Favorite notes
      let favoritesNotes = 0;
      for(let n of allNotesArr) if(n.isFav) favoritesNotes++;

      // Write notes info
      createAssistantResponse(`-Total notes: ${allNotesLng}\n-Total length of all characters in notes: ${allNotesSymbolsLng}\n-Total length of all note descriptions: ${allNotesDescSymbolsLng}\n-Total pinned(favorite) notes you have: ${favoritesNotes}.`);
      setPreInnerHTMLRegexp('-Total notes:', '-Total length of all characters in notes:', '-Total length of all note descriptions:', '-Total pinned(favorite) notes you have:');
    }
    else {
      allNamesArr = [...new Set(matchNames.replace(/names? *: */i, '').split(/, */))];
      let totalResponseText = '';

      for(let n of allNamesArr) {
        const val = n.toLowerCase();

        for(let note in allNotesObj) {
          const noteLower = note.toLowerCase();
          if(noteLower.includes(val) || val.includes(noteLower)) {
            const descLength = allNotesObj[note].description.length;
            const contentLength = allNotesObj[note].txt.replaceAll('\n','').length;
            const startOfTheText = contentLength <= 150 ? allNotesObj[n].txt : allNotesObj[note].txt.slice(0, 150) + '...';
            const isFavorite = allNotesObj[note].isFav || 'false';

            totalResponseText += `-Name: ${note}\n-Description: ${allNotesObj[note].description}\n-Description length: ${descLength}\n-${contentLength <= 100 ? 'Text:' : 'Start of text:'} ${startOfTheText}\n-Text length: ${contentLength}\n-Favorite: ${isFavorite}.`;
            totalResponseText += '\n-------------------------------\n';
          }
        }
      }

      createAssistantResponse(totalResponseText || `I couldn't find any notes for the specified ${allNamesArr.length > 1 ? 'names' : 'name'}: ${allNamesArr.join(', ')}`)
      setPreInnerHTMLRegexp('-Name:', '-Description:', '-Description length:', '-Text:', '-Start of text:', '-Text length:', '-Favorite:');
    }
  }

  // Open
  else if(allOpeningOp.includes(operation)) {
    assistantWrap.classList.remove('show');
    notesWrap.classList.add('show');
  }

  else return createAssistantResponse("Sorry, I didn't understand your command. Could you please clarify it once again?");

  assistantTypeMemory = 'notes';
  assistantMemoryTxtInfo.textContent = 'Last used: notes';
}

// Read url resp fn
function readUrlResp(value, operation) {
  const matchNames = matchAllItems(value, '', 'names');

  let allNamesArr = [...new Set(parseValues(matchNames.replace(/names?\s*(:+|=+)\s*/i, '').split(/\s*,\s*/)))]
    .filter(n => !allUrlsArr.find(obj => obj.title === n))
    .slice(0, allBlockLimitsObj.urls- allUrlsArr.length);

  // Add
  if(allAddingOp.includes(operation)) {
    if(!matchNames) {
      createAssistantResponse("I can't find the names. Please specify the names: ...");
      return setPreInnerHTMLRegexp('names');
    };

    // Check names length
    const respText1 = checkValuesLength(allNamesArr, 'urls', 'urlTitle');
    if(respText1) {
      createAssistantResponse(respText1);
      allNamesArr = allNamesArr.slice(0, 9);
      allNamesArr = allNamesArr.map(n => n.slice(0, allValuesLimit.urlTitle))
    }
    const allNamesLng = allNamesArr.length;

    let assistantAllUrlsArr = parseValues(matchAllItems(value, 'url', 'urls'));
    // Check urls length
    const respText2 = checkValuesLength(assistantAllUrlsArr, 'urls');
    if(respText2) {
      createAssistantResponse(respText2);
      assistantAllUrlsArr = assistantAllUrlsArr.slice(0, 9);
    }

    const allUrlsLng = assistantAllUrlsArr.length;
    if(!allUrlsLng) return createAssistantResponse("You forgot to specify urls or wrote the command incorrectly, I can't create a url without urls.");
    if(allUrlsLng < allNamesLng && allUrlsLng !== 1) {
      createAssistantResponse(`You listed ${allNamesLng} names, but you only have ${allUrlsLng} urls.\nPlease provide ${allNamesLng - allUrlsLng} more urls, and in the correct order so I can properly assign them to your urls.`)
      return setPreInnerHTMLRegexp('names', 'urls', 'in the correct order');
    }

    let allUrlsForAdd = allUrlsLng === allNamesLng ? assistantAllUrlsArr : new Array(allNamesLng).fill(assistantAllUrlsArr[0]);
    allUrlsForAdd = allUrlsForAdd.map(url => {
      if(!url.startsWith('http')) return `https://${url}`;
      else return url;
    })

    for(let i = 0; i < allNamesLng; i++) {
      const title = allNamesArr[i];
      const url = allUrlsForAdd[i];
      const imgUrl = '/all-imgs/Classic-dashboard-img.webp';
      allUrlsArr.push({title, url, imgUrl, imgPath: null})
    }

    const btn = createAssistantResponse(`All your urls (${allNamesArr.join(', ')}) have been successfully added.`, true);
    initShowAddedInType('url', btn, allNamesArr);
    setPreInnerHTMLRegexp('have been successfully added.');
    setOpenBtnsTexts();

    // Set note unsaved
    urlSaveBtn.classList.add('unsaved');
  }

  // Delete
  else if(allDeletingOp.includes(operation)) {
    if(!matchNames) {
      createAssistantResponse("I can't find the names. Please specify the names: ...");
      return setPreInnerHTMLRegexp('names');
    }
    const allNamesForDeleteOp = [...new Set(matchNames.replace(/names? *: */, '').split(/, */))];

    const allDeleteNames = [];
    const notFoundNames = [];

    const deletedUrlsForUndo = [];

    for(let n of allNamesForDeleteOp) {
      if(allUrlsArr.find(o => o.title === n)) {
        deletedUrlsForUndo.push(allUrlsArr.find(o => o.title === n));
        allDeleteNames.push(n);
      }
      else notFoundNames.push(n);
    }

    if(!allDeleteNames.length && notFoundNames.length) {
      createAssistantResponse(`It seems you wanted to delete these urls: "${notFoundNames.join(', ')}",\nBut unfortunately I couldn't find them.\nPlease check if these urls exist.`);
      return setPreInnerHTMLRegexp("I couldn't find them.");
    }
    else if(!allDeleteNames.length) {
      createAssistantResponse("You did not specify the names of the urls items for deletion or specified them incorrectly.\nPlease review your command.");
      return setPreInnerHTMLRegexp('Please review your command.');
    };

    if(notFoundNames.length) {
      const btn = createAssistantResponse(`I couldn't find these urls: "${notFoundNames.join(', ')}", but successfully deleted these: ${allDeleteNames.join(', ')}.`, true);
      initUndoBtn('url', btn, 'delete');
      setPreInnerHTMLRegexp("I couldn't find these urls:", "successfully deleted these:");
    }
    else {
      const btn = createAssistantResponse(`All your urls (${allDeleteNames.join(', ')}) have been successfully deleted.`, true);
      initUndoBtn('url', btn, 'delete');
      setPreInnerHTMLRegexp('have been successfully deleted.');
    };
    // Delete
    allUrlsArr = allUrlsArr.filter(o => !allDeleteNames.includes(o.title));

    savedDataForUndo.url = deletedUrlsForUndo;

    setOpenBtnsTexts();
    // Set unsaved note
    urlSaveBtn.classList.add('unsaved');
  }

  // Search
  else if(allSearchingOp.includes(operation)) {
    value = value.toLowerCase();
    const allKeys = value.includes('key') ? matchAllItems(value, '', 'keys') : [''];
    const allNames = value.includes('name') ? matchAllItems(value, '', 'names').replace(/names?\s*(:+|=+)\s*/i).split(/\s*,\s*/) : [''];
    const allLinks = value.match(/url|link/g)?.length > 1 ? matchAllItems(value, 'url', 'urls') : [''];

    assistantBlockForShowBlocks.textContent = '';
    const frag = document.createDocumentFragment();

    if(allKeys.join('').trim()) {
      for(let o of allUrlsArr) {
        for(let k of allKeys) {
          if(o.title.toLowerCase().includes(k.toLowerCase()) || o.url.toLowerCase().includes(k.toLowerCase())) {
            frag.appendChild(createBlockForAssistantShow(o.title, 'url', k));
            break;
          }
        }
      }
    }
    else if(allNames.join('').trim()) {
      for(let o of allUrlsArr) {
        for(let k of allNames) {
          if(o.title.toLowerCase().includes(k.toLowerCase())) {
            frag.appendChild(createBlockForAssistantShow(o.title, 'url', k));
            break;
          }
        }
      }
    }
    else if(allLinks.join('').trim()) {
      for(let o of allUrlsArr) {
        for(let k of allLinks) {
          if(o.url.toLowerCase().includes(k.toLowerCase())) {
            frag.appendChild(createBlockForAssistantShow(o.title, 'url', k));
            break;
          }
        }
      }
    }
    else return useAiResp(value);

    frag.appendChild(createAssistantShowBlokCloseBtn());
    if(frag.childElementCount > 1) {
      assistantBlockForShowBlocks.appendChild(frag);
      assistantBlockForShowBlocks.classList.add('open');
    }
    else return createAssistantResponse("Nothing found.");
  }

  // Clear
  else if(allClearingOp.includes(operation)) {
    savedDataForUndo.url = allUrlsArr;
    allUrlsArr = [];
    const btn = createAssistantResponse('All your urls have been deleted.', true);
    initUndoBtn('url', btn, 'clear');

    setPreInnerHTMLRegexp('have been deleted.');
    setOpenBtnsTexts();
    urlSaveBtn.classList.add('unsaved');
  }

  // Save
  else if(allSavingOp.includes(operation)) urlSaveBtn.click();

  // Showing/list
  else if(allShowingOp.includes(operation)) {
    if(!allUrlsArr.length) return createAssistantResponse("You don't have a urls");

    let totalResponseText = '';
    const allWordsForHeightLight = [];
    console.log(value);

    if(value.toLowerCase().includes('name')) {
      totalResponseText = `Total names found: ${allUrlsArr.length}\n`;
      for(let o of allUrlsArr) {
        totalResponseText += `- ${o.title}\n`;
        allWordsForHeightLight.push(`- ${o.title}`);
      }
      createAssistantResponse(totalResponseText);
      setPreInnerHTMLRegexp(...allWordsForHeightLight);
    }
    else if(value.replace(/[^a-z0-9а-яіїєґ\s]/ig, '').split(' ').filter(w => allUrlTypes.includes(w)).length > 1) {
      totalResponseText = `Total urls/links found: ${allUrlsArr.length}\n`;
      for(let o of allUrlsArr) {
        totalResponseText += `- ${o.url}\n`;
        allWordsForHeightLight.push(`- ${o.url}`);
      }
      createAssistantResponse(totalResponseText);
      setPreInnerHTMLRegexp(...allWordsForHeightLight);
    }

    else {
      assistantBlockForShowBlocks.textContent = '';
      const frag = document.createDocumentFragment();

      for(let o of allUrlsArr) frag.appendChild(createBlockForAssistantShow(o.title, 'url'));

      frag.appendChild(createAssistantShowBlokCloseBtn());
      assistantBlockForShowBlocks.appendChild(frag);

      assistantBlockForShowBlocks.classList.add('open');
    }
  }

  // Read/info
  else if(allReadingOp.includes(operation)) {
    if(!matchNames) {
      // All urls lng
      const allUrlsLng = allUrlsArr.length;

      // Link from http(s)
      let linkFromHttp = 0;
      let linkFromHttps = 0;
      // Favorites urls
      let favoritesUrls = 0;

      for(let o of allUrlsArr) {
        if(!o.url.startsWith('http')) linkFromHttps++;
        else if(o.url.startsWith('https')) linkFromHttps++;
        else linkFromHttp++;

        if(o.isFav) favoritesUrls++;
      }

      createAssistantResponse(`-Total urls: ${allUrlsLng}\n-Links from http: ${linkFromHttp}\n-Links from https: ${linkFromHttps}\n-Total pinned(favorite) urls you have: ${favoritesUrls}.`);
      setPreInnerHTMLRegexp('-Total urls:', '-Links from https:', '-Links from http:', '-Total pinned(favorite) urls you have:');
    }
    else {
      allNamesArr = [...new Set(matchNames.replace(/names? *: */i, '').split(/, */))];
      let totalResponseText = '';

      for(let n of allNamesArr) {
        const val = n.toLowerCase();

        for(let urlObj of allUrlsArr) {
          const titleLower = urlObj.title.toLowerCase();
          if(titleLower.includes(val) || val.includes(titleLower)) {
            const url = urlObj.url;
            const isFavorite = urlObj.isFav || 'false';
            const urlStart = url.startsWith('https') ? 'https' : !url.startsWith('http') ? 'https' : 'http';

            totalResponseText += `-Name: ${urlObj.title}\n-Url: ${url}\n-Favorite: ${isFavorite}\n-Url from: ${urlStart}`;
            totalResponseText += '\n-------------------------------\n';
          }
        }

        createAssistantResponse(totalResponseText || `I couldn't find any urls for the specified ${allNamesArr.length > 1 ? 'names' : 'name'}: ${allNamesArr.join(', ')}`);
        setPreInnerHTMLRegexp('-Name:', '-Url:', '-Favorite:', '-Url from:');
      }
    }
  }

  // Open
  else if(allOpeningOp.includes(operation)) {
    assistantWrap.classList.remove('show');
    urlsWrap.classList.add('show');
  }

  else return createAssistantResponse("Sorry, I didn't understand your command. Could you please clarify it once again?");

  assistantTypeMemory = 'urls';
  assistantMemoryTxtInfo.textContent = 'Last used: urls';
}

// Read code resp fn
function readCodeResp(value, operation) {
  const matchNames = matchAllItems(value, '', 'names');

  let allNamesArr = [...new Set(parseValues(matchNames.replace(/names?\s*(:+|=+)\s*/i, '').split(/\s*,\s*/)))]
    .filter(n => !allUserCodesObj[n])
    .slice(0, allBlockLimitsObj.codes - Object.keys(allUserCodesObj).length);

  // Add
  if(allAddingOp.includes(operation)) {
    if(!matchNames) {
      createAssistantResponse("I can't find the names. Please specify the names: ...");
      return setPreInnerHTMLRegexp('names');
    };

    // Check names length
    const respText1 = checkValuesLength(allNamesArr, 'code', 'codeName');
    if(respText1) {
      createAssistantResponse(respText1);
      allNamesArr = allNamesArr.slice(0, 9);
      allNamesArr = allNamesArr.map(n => n.slice(0, allValuesLimit.codeName));
    }
    const allNamesLng = allNamesArr.length;

    let allLangsArr = parseValues(matchAllItems(value, 'code', 'langs'));
    // Check languages length
    if(!allLangsArr.length) {
      createAssistantResponse("You forgot to specify languages or wrote the command incorrectly, I can't create a code without languages.");
      return setPreInnerHTMLRegexp("I can't create a code without languages.");
    };

    const respText = checkValuesLength(allLangsArr);
    if(respText) {
      createAssistantResponse(respText);
      allLangsArr = allLangsArr.slice(0, 9);
    }
    allLangsArr = allLangsArr.map(l => {
      l = l.toLowerCase();
      if(l === 'js' || l === 'script') return 'javascript';
      else if(/styles?/i.test(l)) return 'css';
      else if(l === 'dom') return 'html';
      else return l;
    })
    // Check language supporting
    for(let l of allLangsArr) {
      l = l.toLowerCase();
      if(l !== 'javascript' && l !== 'css' && l !== 'html') return createAssistantResponse(`You specified: ${l}, but this is not a supported programming language`);
    }
    const allLangsLng = allLangsArr.length;

    if(allLangsLng < allNamesLng && allLangsLng !== 1) {
      createAssistantResponse(`You listed ${allNamesLng} names, but you only have ${allLangsLng} languages.\nPlease provide ${allNamesLng - allLangsLng} more languages, and in the correct order so I can properly assign them to your code.`);
      return setPreInnerHTMLRegexp('names', 'languages', 'in the correct order');
    }

    const allLangsForAdd = allLangsLng === allNamesLng ? allLangsArr : new Array(allNamesLng).fill(allLangsArr[0]);

    for(let i = 0; i < allNamesLng; i++) {
      allUserCodesObj[allNamesArr[i]] = { code: '', lock: false, lang: allLangsForAdd[i] }
    }

    const btn = createAssistantResponse(`All your codes (${allNamesArr.join(', ')}) have been successfully added.`, true);
    initShowAddedInType('code', btn, allNamesArr);
    setPreInnerHTMLRegexp('have been successfully added.');
    setOpenBtnsTexts();
    // Set code unsaved
    codeSaveBtn.classList.add('unsaved');
  }

  // Delete
  else if(allDeletingOp.includes(operation)) {
    if(!matchNames) {
      createAssistantResponse("I can't find the names. Please specify the names: ...");
      return setPreInnerHTMLRegexp('names');
    }
    const allNamesForDeleteOp = [...new Set(matchNames.replace(/names? *: */, '').split(/, */))];

    const allDeleteNames = [];
    const notFoundNames = [];

    const deletedCodesForUndo = {};

    for(let n of allNamesForDeleteOp) {
      if(allUserCodesObj[n]) {
        deletedCodesForUndo[n] = allUserCodesObj[n];
        delete allUserCodesObj[n];
        allDeleteNames.push(n);
      }
      else notFoundNames.push(n);
    }

    if(!allDeleteNames.length && notFoundNames.length) {
      createAssistantResponse(`It seems you wanted to delete these codes: "${notFoundNames.join(', ')}",\nBut unfortunately I couldn't find them.\nPlease check if these codes exist.`);
      return setPreInnerHTMLRegexp('Please check if these codes exist.');
    }
    else if(!allDeleteNames.length) {
      createAssistantResponse("You did not specify the names of the codes items for deletion or specified them incorrectly.\nPlease review your command.");
      return setPreInnerHTMLRegexp('Please review your command.');
    };

    if(notFoundNames.length) {
      const btn = createAssistantResponse(`I couldn't find these codes: "${notFoundNames.join(', ')}", but successfully deleted these: ${allDeleteNames.join(', ')}.`, true);
      initUndoBtn('code', btn, 'delete');
      setPreInnerHTMLRegexp("I couldn't find these codes:", "successfully deleted these:");
    }
    else {
      const btn = createAssistantResponse(`All your codes (${allDeleteNames.join(', ')}) have been successfully deleted.`, true);
      initUndoBtn('code', btn, 'delete');
      setPreInnerHTMLRegexp("have been successfully deleted.");
    };

    savedDataForUndo.code = deletedCodesForUndo;

    setOpenBtnsTexts();
    // Set unsaved note
    urlSaveBtn.classList.add('unsaved');
  }

  // Search
  else if(allSearchingOp.includes(operation)) {
    value = value.toLowerCase();
    const allKeys = value.includes('key') ? matchAllItems(value, '', 'keys') : [''];
    const allNames = value.includes('name') ? matchAllItems(value, '', 'names').replace(/names?\s*(:+|=+)\s*/i).split(/\s*,\s*/) : [''];
    const allLangs = value.includes('lang') ? matchAllItems(value, 'code', 'langs') : [''];

    assistantBlockForShowBlocks.textContent = '';
    const frag = document.createDocumentFragment();

    if(allKeys.join('').trim()) {
      for(let n in allUserCodesObj) {
        for(let k of allKeys) {
          if(n.toLowerCase().includes(k.toLowerCase()) || allUserCodesObj[n].code.toLowerCase().includes(k.toLowerCase())) {
            frag.appendChild(createBlockForAssistantShow(n, 'code', k));
            break;
          }
        }
      }
    }
    else if(allNames.join('').trim()) {
      for(let n in allUserCodesObj) {
        for(let k of allNames) {
          if(n.toLowerCase().includes(k.toLowerCase())) {
            frag.appendChild(createBlockForAssistantShow(n, 'code', k));
            break;
          }
        }
      }
    }
    else if(allLangs.join('').trim()) {
      for(let n in allUserCodesObj) {
        for(let k of allLangs) {
          const lang = allUserCodesObj[n].lang.toLowerCase().trim();
          if(lang.includes(k.toLowerCase())) {
            frag.appendChild(createBlockForAssistantShow(n, 'code'));
            break;
          }
        }
      }
    }
    else return useAiResp(value);

    frag.appendChild(createAssistantShowBlokCloseBtn());
    if(frag.childElementCount > 1) {
      assistantBlockForShowBlocks.appendChild(frag);
      assistantBlockForShowBlocks.classList.add('open');
    }
    else return createAssistantResponse("Nothing found.");
  }

  // Clear
  else if(allClearingOp.includes(operation)) {
    savedDataForUndo.code = allUserCodesObj;
    allUserCodesObj = {};
    const btn = createAssistantResponse('All your codes have been deleted.', true);
    initUndoBtn('code', btn, 'clear');

    setPreInnerHTMLRegexp('have been deleted.');
    setOpenBtnsTexts();
    codeSaveBtn.classList.add('unsaved');
  }

  // Save
  else if(allSavingOp.includes(operation)) codeSaveBtn.click();

  // Showing/list
  else if(allShowingOp.includes(operation)) {
    let totalResponseText = '';
    const allWordsForHeightLight = [];

    const allCodesArr = Object.keys(allUserCodesObj);
    const allCodesLng = allCodesArr.length;

    if(!allCodesLng) return createAssistantResponse("You don't have a codes");

    if(value.toLowerCase().includes('name')) {
      totalResponseText = `Total names found: ${allCodesLng}\n`;
      for(let n of allCodesArr) {
        totalResponseText += `- ${n}\n`;
        allWordsForHeightLight.push(`- ${n}`);
      }
      createAssistantResponse(totalResponseText);
      setPreInnerHTMLRegexp(...allWordsForHeightLight);
    }
    else if(value.toLowerCase().includes('lang')) {
      totalResponseText = `Total languages found: ${allCodesLng}\n`;
      for(let n of allCodesArr) {
        totalResponseText += `- ${allUserCodesObj[n].lang}\n`;
        allWordsForHeightLight.push(`- ${allUserCodesObj[n].lang}`);
      }
      createAssistantResponse(totalResponseText);
      setPreInnerHTMLRegexp(...allWordsForHeightLight);
    }

    else {
      assistantBlockForShowBlocks.textContent = '';
      const frag = document.createDocumentFragment();

      for(let n in allUserCodesObj) frag.appendChild(createBlockForAssistantShow(n, 'code'));

      frag.appendChild(createAssistantShowBlokCloseBtn());
      assistantBlockForShowBlocks.appendChild(frag);

      assistantBlockForShowBlocks.classList.add('open');
    }
  }

  // Read/info
  else if(allReadingOp.includes(operation)) {
    if(!matchNames) {
      const allCodesArr = Object.keys(allUserCodesObj);
      // All codes lng
      const allCodesLng = allCodesArr.length;

      // All used languages
      let allHtmlLangs = 0;
      let allCssLangs = 0;
      let allJsLangs = 0;
      // Locked code
      let lockedCode = 0;

      for(let n in allUserCodesObj) {
        if(allUserCodesObj[n].lang.toLowerCase() === 'html') allHtmlLangs++;
        else if(allUserCodesObj[n].lang.toLowerCase() === 'css') allCssLangs++;
        else if(allUserCodesObj[n].lang.toLowerCase() === 'javascript') allJsLangs++;

        if(allUserCodesObj[n].lock) lockedCode++;
      }

      // All code symbols lng
      const allCodeSymbolsLng = allCodesArr.reduce((sum, n) => sum + allUserCodesObj[n].code.replaceAll('\n','').replaceAll(' ','').length, 0);

      // Show codes info
      createAssistantResponse(`-Total code blocks: ${allCodesLng}\n-Languages used:\n  -HTML: ${allHtmlLangs}\n  -CSS: ${allCssLangs}\n  -JS: ${allJsLangs}\n-Total characters in code: ${allCodeSymbolsLng}\n-Locked code: ${lockedCode}`);
      setPreInnerHTMLRegexp('-Total code blocks:', '-Languages used:', '-HTML:', '-CSS:', '-JS:', '-Total characters in code:', '-Locked code:');
    }
    else {
      allNamesArr = [...new Set(matchNames.replace(/names? *: */i, '').split(/, */))];
      let totalResponseText = '';

      for(let n of allNamesArr) {
        const val = n.toLowerCase();

        for(let code in allUserCodesObj) {
          const codeLower = code.toLowerCase();
          if(codeLower.includes(val) || val.includes(codeLower)) {
            const lock = allUserCodesObj[code].lock;
            const codeLng = allUserCodesObj[code].code.replaceAll('\n', '').replaceAll(' ', '').length;

            totalResponseText += `-Name: ${code}\n-Lock: ${lock}\n-Code length: ${codeLng}\n-Language: ${allUserCodesObj[code].lang}.`;
            totalResponseText += '\n-------------------------------\n';
          }
        }
      }

      createAssistantResponse(totalResponseText || `I couldn't find any notes for the specified ${allNamesArr.length > 1 ? 'names' : 'name'}: ${allNamesArr.join(', ')}`)
      setPreInnerHTMLRegexp('-Name:', '-Lock:', '-Code length:', '-Language:');
    }
  }

  // Open
  else if(allOpeningOp.includes(operation)) {
    assistantWrap.classList.remove('show');
    userCodeWrap.classList.add('show');
  }

  else return createAssistantResponse("Sorry, I didn't understand your command. Could you please clarify it once again?");

  assistantTypeMemory = 'codes';
  assistantMemoryTxtInfo.textContent = 'Last used: codes';
}