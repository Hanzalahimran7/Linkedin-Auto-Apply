const loginLink = document.querySelector('.login-link');
const mainWindow = document.querySelector('.main-window');
const userInput = document.querySelector('.user-input');
const startButton = document.getElementById('start');
const stopButton = document.getElementById('stop');
const settingButton = document.getElementById('setting');
const saveButton = document.getElementById('save');
const cvInput = document.getElementById('cvInput');
const outputDiv = document.getElementById('output');

import {
  getDocument,
  GlobalWorkerOptions,
} from './pdfjs-4.0.379-dist/build/pdf.mjs';
GlobalWorkerOptions.workerSrc = './pdfjs-4.0.379-dist/build/pdf.worker.mjs';

let user_data = {
  fname: '',
  lname: '',
  country_code: '',
  phone: '',
  gpt_key: '',
  email: '',
  street: '',
  city: '',
  postal_code: '',
  state: '',
  full_name: '',
  cover_letter: '',
  about_you: '',
};

const insertDataFromBackground = (data) => {
  document.querySelector('#fname').value = data.fname;
  document.querySelector('#lname').value = data.lname;
  document.querySelector('#country_code').value = data.country_code;
  document.querySelector('#gpt_key').value = data.gpt_key;
  document.querySelector('#phone').value = data.phone;
  document.querySelector('#email').value = data.email;
  document.querySelector('#street').value = data.street;
  document.querySelector('#city').value = data.city;
  document.querySelector('#postal_code').value = data.postal_code;
  document.querySelector('#state').value = data.state;
  document.querySelector('.cover-letter').value = data.cover_letter;
};

const extractTextFromCV = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    let allText = '';
    reader.onload = async (e) => {
      const arrayBuffer = e.target.result;
      try {
        const pdfDoc = await getDocument(arrayBuffer).promise;
        const numPages = pdfDoc.numPages;

        for (let i = 1; i <= numPages; i++) {
          try {
            const page = await pdfDoc.getPage(i);
            const pageText = await page.getTextContent();
            const pageContent = pageText.items
              .map(function (s) {
                return s.str;
              })
              .join(' ');
            allText += pageContent;
          } catch (error) {
            console.error(`Error reading page ${i}:`, error);
          }
        }
        resolve(allText);
      } catch (error) {
        reject(error);
      }
    };
    reader.readAsArrayBuffer(file);
  });
};

const extractDataFromInput = async () => {
  user_data.fname = document.querySelector('#fname').value;
  user_data.lname = document.querySelector('#lname').value;
  user_data.gpt_key = document.querySelector('#gpt_key').value;
  user_data.full_name = user_data.fname + ' ' + user_data.lname;
  user_data.country_code = document.querySelector('#country_code').value;
  user_data.phone = document.querySelector('#phone').value;
  user_data.email = document.querySelector('#email').value;
  user_data.street = document.querySelector('#street').value;
  user_data.city = document.querySelector('#city').value;
  user_data.postal_code = document.querySelector('#postal_code').value;
  user_data.state = document.querySelector('#state').value;
  user_data.cover_letter = document.querySelector('.cover-letter').value;
  // localStorage.setItem('fname', user_data.fname);
  // localStorage.setItem('lname', user_data.lname);
  // localStorage.setItem('country_code', user_data.country_code);
  // localStorage.setItem('phone', user_data.phone);
  // localStorage.setItem('email', user_data.email);
  // localStorage.setItem('street', user_data.street);
  // localStorage.setItem('city', user_data.city);
  // localStorage.setItem('postal_code', user_data.postal_code);
  const formFields = [
    'fname',
    'lname',
    'country_code',
    'phone',
    'gpt_key',
    'email',
    'street',
    'city',
    'postal_code',
    'state',
  ];
  formFields.forEach((field) => {
    window.localStorage.setItem(field, document.getElementById(field).value);
  });
  window.localStorage.setItem(
    'cover_letter',
    document.querySelector('.cover-letter').value
  );
  console.log(localStorage);
  const file = cvInput.files[0];
  if (file) {
    user_data.about_you = await extractTextFromCV(file);
  } else {
    outputDiv.textContent = 'Please select a CV file.';
  }
};

startButton.addEventListener('click', () => {
  try {
    chrome.runtime.sendMessage({ type: 'StartApply' });
  } catch (e) {
    console.log(e);
  }
});

stopButton.addEventListener('click', () => console.log('Stop'));

saveButton.addEventListener('click', async () => {
  try {
    await extractDataFromInput();
    userInput.style.display = 'none';
    saveButton.style.display = 'none';
    mainWindow.style.display = 'block';
    chrome.runtime.sendMessage({ type: 'SaveData', user_data: user_data });
    console.log(user_data);
  } catch (error) {
    console.log(error);
  }
});

settingButton.addEventListener('click', async () => {
  try {
    userInput.style.display = 'block';
    saveButton.style.display = 'block';
    mainWindow.style.display = 'none';
    console.log('Setting', user_data);
    insertDataFromBackground(user_data);
  } catch (error) {
    console.log(error);
  }
});

window.addEventListener('load', () => {
  console.log('loading');
  try {
    // Retrieve all form fields from local storage
    const formFields = [
      'fname',
      'lname',
      'country_code',
      'phone',
      'gpt_key',
      'email',
      'street',
      'city',
      'postal_code',
      'state',
    ];
    formFields.forEach((field) => {
      const value = window.localStorage.getItem(field);
      if (value) {
        user_data[field] = value;
      }
    });
    // Retrieve cover letter separately
    const coverLetterValue = window.localStorage.getItem('cover_letter');
    if (coverLetterValue) {
      document.querySelector('.cover-letter').value = coverLetterValue;
    }
  } catch (error) {
    // Handle potential errors gracefully
    console.error('Error retrieving data from local storage:', error);
    // Optionally clear local storage to avoid inconsistencies
    window.localStorage.clear();
  }
  console.log('Got data', user_data);
});

// const onButtonClick = (event) => {
//   console.log('Hanzalah');
//   const button = event.target;
//   if (button.id === 'start') {
//     try {
//       chrome.runtime.sendMessage({ type: 'StartApply' });
//     } catch (e) {
//       console.log(e);
//     }
//   } else if (button.id === 'stop') {
//     try {
//       chrome.runtime.sendMessage({ type: 'StopApply' });
//     } catch (e) {
//       console.log(e);
//     }
//   } else if (button.id == 'save') {
//     try {
//       const collected_data = extractDataFromInput();
//       chrome.runtime.sendMessage({ type: 'SaveData', data: collected_data });

//       userInput.style.display = 'none';
//       saveButton.style.display = 'none';

//       mainWindow.style.display = 'block';
//     } catch (error) {
//       console.log(error);
//     }
//   }
// };

// chrome.runtime.onMessage.addListener(async function (
//   request,
//   sender,
//   sendResponse
// ) {
//   if (request.type == 'SendData') {
//     insertDataFromBackground(request.data);
//   } else if (request.type == 'startButtonStatus') {
//     console.log(request.isProgress);
//     startButton.disabled = request.isProgress;
//   }
// });

// chrome.runtime.sendMessage({
//   type: 'checkProgress',
// });
