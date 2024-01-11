var questions = [];
var currentQuestionIndex = 0;
var startTime = null;
var endTime = null;
var selectedOption = null;
var selectedIndex = null;
var allClicks = [];
var allResponses = [];
var studyTime = 1;
const startStudyTime = new Date().getTime();
const endStudyTime = startStudyTime + studyTime * 60 * 1000;

// Function to read CSV file
function readCSV(file, callback) {
    Papa.parse(file, {
        download: true,
        complete: function (result) {
            callback(result.data);
        }
    });
}

function createResponseData(ques, res, question_tag, allClicks, startT, endT, elaspsedT){
    var responseData = {
        question: ques,
        response: res,
        tag: question_tag,
        clicks : allClicks,
        startT: JSON.stringify(startT),
        endT: JSON.stringify(endT),
        responseT: JSON.stringify(elaspsedT),
    };
    allResponses.push(responseData);
}
function updateTimer() {
    var currentTime = new Date().getTime();
    const remainingTime = endStudyTime - currentTime;
    if (remainingTime <= 0) {
      // Time is up, show the submit button
      displayLastPage();
    } else {
      // Calculate remaining minutes and seconds
      const minutes = Math.floor(remainingTime / 60000);
      const seconds = Math.floor((remainingTime % 60000) / 1000);

      document.getElementById('timer').innerHTML = `Time remaining: ${minutes}m ${seconds}s`;
      setTimeout(updateTimer, 1000); // Update every second
    }
}
// Function to display 'End-of-survey'
function displayLastPage() {
    var submitButton = document.getElementById("submit-btn");
    submitButton.style.display = 'block';
    var endPage = document.getElementById("end-container");
    endPage.innerHTML = "";
    endPage.textContent = "Thank you for participating in the study. Please click on the submit button to finish.";
}
// Function to display the question
function displayQuestion() {
    var questionHeading = document.getElementById("question-heading");
    var questionContainer = document.getElementById("question-container");
    var optionsContainer = document.getElementById("options-container");
    var nextButton = document.getElementById("next-btn");
    var submitButton = document.getElementById("submit-btn");

    // Display the question
    questionHeading.textContent = "Question "+ (currentQuestionIndex+1);
    questionContainer.textContent = questions[currentQuestionIndex].question;

    // Display the options
    optionsContainer.innerHTML = "";
    questions[currentQuestionIndex].options.forEach(function (option, index) {
        var optionDiv = document.createElement("div");
        optionDiv.className = "option";
        optionDiv.textContent = option;

        optionDiv.addEventListener("click", function () {
            // Log the selected option
            selectedOption = option;
            selectedIndex = index;
            console.log("Selected option: " + selectedIndex); //create dictionary and send with form
            allClicks.push(index);

            // Remove previous selection stylin|}g
            document.querySelectorAll('.option').forEach(function (el) {
                el.style.backgroundColor = "";
            });

            // Add new selection styling
            optionDiv.style.backgroundColor = "#e0e0e0";
        });

        optionsContainer.appendChild(optionDiv);
    });

    nextButton.addEventListener("click", function () {
        if (selectedOption) {
            endTime = new Date();
            var elapsedTime = endTime - startTime;
            var question_tag = JSON.stringify(questions[currentQuestionIndex].tag);
            var correct_option = JSON.stringify(questions[currentQuestionIndex].correct_option);

            if (question_tag.replace(/[^a-zA-Z0-9]/g, '') == "attentionCheck")
            {
                console.log("Enter check 1");
                if(correct_option.replace(/[^a-zA-Z0-9]/g, '') != selectedIndex)
                {
                    console.log("Enter check 2");
                    document.getElementById("question-box").style.display = 'none';
                    var endPage = document.getElementById("end-container");
                    endPage.textContent = "ATTENTION CHECK FAILED! \n Thank you for participating in the study. Please click on the submit button to end.";
                    submitButton.style.display = 'block';
                    return;
                }
            }

            createResponseData(JSON.stringify(questions[currentQuestionIndex].question), JSON.stringify(selectedOption), JSON.stringify(questions[currentQuestionIndex].tag), allClicks, startTime, endTime, elapsedTime);

            // Move to the next question
            currentQuestionIndex++;
            selectedOption = null; // Reset selected option
            allClicks = [];
            if (currentQuestionIndex < questions.length) {
                displayQuestion();
                startTime = new Date(); // Record start time for the next question
            } else {
                document.getElementById("question-box").style.display = 'none';
                updateTimer();
            }
        } 
    });
    submitButton.addEventListener("click", function () {
            // create the form element and point it to the correct endpoint
            if (selectedOption) {
            var endTime = new Date();
            var elapsedTime = endTime - startTime;
        }
        console.log("All Responses: " + JSON.stringify(allResponses));
        const urlParams = new URLSearchParams(window.location.search); 
        const form = document.createElement('form');
        form.action = (new URL('mturk/externalSubmit', urlParams.get('turkSubmitTo'))).href;
        form.method = 'post';
        
        // attach the assignmentId
        const inputAssignmentId = document.createElement('input');
        inputAssignmentId.name = 'assignmentId';
        inputAssignmentId.value = urlParams.get('assignmentId');
        inputAssignmentId.hidden = true;
        form.appendChild(inputAssignmentId);
        
        // attach data I want to send back
        const responseUserData = document.createElement('input');
        responseUserData.name = 'response';
        responseUserData.value = JSON.stringify(allResponses);
        responseUserData.hidden = true;
        form.appendChild(responseUserData);
        
        // attach the form to the HTML document and trigger submission
        document.body.appendChild(form);
        form.submit();
    });

    nextButton.style.display = "block";
    // submitButton.style.display = currentQuestionIndex === questions.length-1 ? 'block' : 'none';
    submitButton.style.display = 'none';
}

// Entry point
readCSV("questions-sample.csv", function (data) {
    // Assuming CSV structure: question, option1, option2, ..., correctAnswer
    for (var i = 0; i < data.length; i++) {
        var questionData = data[i];
        var question = {
            question: questionData[0],
            options: questionData.slice(1, -2),
            tag: questionData[questionData.length - 2],
            correct_option: questionData[questionData.length - 1],
        };
        questions.push(question);
    }

    startTime = new Date();
    console.log("Number of questions: " + questions.length);
    displayQuestion();
});