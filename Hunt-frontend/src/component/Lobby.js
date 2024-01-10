import React, { useEffect, useState } from 'react'
import {over} from 'stompjs';
import SockJS from 'sockjs-client';

var stompClient = null;
const Lobby = () => {
    const [userData, setUserData] = useState({
        userId: '',
        username:'',
        lobbyCode: '',
        connected: false
    })

    const predefinedQuestions = [
        "As our investigation begins, our focus turns to the individual seated by the fire. This suspect discreetly placed an order, the details of which are concealed within a downloadable file recovered during our inquiry. Your first task is to decode this file to reveal the contents of their order. ",
        "Question 2",
        "Question 3",
        "Question 4",
        "Question 5",
        "Question 6",
        "Question 7",
        "Question 8",
        "Question 9",
        "Question 10"
    ];

    const fileNames = [
        'Question1.txt',
        'Question2.txt',
    ];

    const [lobbyMembers, setLobbyMembers] = useState([]);
    
    const connect = ()=>{
        let Sock = new SockJS('http://34.247.90.59:8080/ws');
        stompClient = over(Sock);
    }

    const onCreate = async () => {
        const newLobbyCode = await generateCode();
        const newUserId = await generateUserID();
        const lobby = {
            lobbyCode: newLobbyCode,
            players: [userData.username],
            playerIds: [newUserId]
        };
        stompClient.send('/app/lobby/create', {}, JSON.stringify(lobby));
        stompClient.subscribe('/user/' + newLobbyCode + '/private', onMessageReceived);
        setUserData({...userData, "connected": true, "userId": newUserId, "lobbyCode": newLobbyCode})
    }

    const onJoin = async () => {
        const newUserId = await generateUserID();
        const lobby = {
            lobbyCode: userData.lobbyCode,
            players: [userData.username],
            playerIds: [newUserId]
        };
        stompClient.subscribe('/user/' + userData.lobbyCode + '/private', onMessageReceived);
        stompClient.send('/app/lobby/join', {}, JSON.stringify(lobby));
        setUserData({...userData, "connected": true, "userId": newUserId})
    }

    const joinGame = () => {
        connect();
        stompClient.connect({},onJoin, onError);
    }

    const createGame =()=> {
        connect();
        stompClient.connect({},onCreate, onError);
        setLobbyMembers([userData.username])
    }

    const generateCode = () => {
        return new Promise((resolve) => {
            const min = 100000;
            const max = 999999;
            const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
            const codeAsString = randomNumber.toString(); // Convert the number to a string
            resolve(codeAsString);
        });
    };

    const generateUserID = () => {
        return new Promise((resolve) => {
            const userId = 'user-' + Math.random().toString(36).substr(2, 9);
            resolve(userId);
        });
    };

    const onError = (err) => {
        console.log(err);
    }

    const onMessageReceived = (payload) => {
        const receivedData = JSON.parse(payload.body);
      
        if (receivedData.status === 'JOINED') {
          if (receivedData.players) {
            const updatedMembers = receivedData.players;
            setLobbyMembers(updatedMembers);
          }
        } else if (receivedData.status === 'FAILED') {
            const dropdowns = document.querySelectorAll(`#question-${receivedData.question} select`);
            if (dropdowns) {
                const selectedOptions = Array.from(dropdowns).map(box => box.options[box.selectedIndex].text).join(' ');
                const questionSection = document.getElementById(`question-${receivedData.question}`);
                if (questionSection) {
                    const errorText = document.createElement('p');
                    errorText.textContent = `${selectedOptions} is incorrect, try again.`;
                    questionSection.appendChild(errorText);
                    setTimeout(() => {
                        errorText.remove();
                    }, 2000);
                }
            }

            //else Success:
        } else {
            const questionNumber = receivedData.question;
            const questionSection = document.getElementById(`question-${questionNumber}`);
            let selectedOptions = '';
            let correct = 0;
            let correctAnswers = receivedData.answers[0];
            if (questionSection) {
                const selectBoxes = questionSection.querySelectorAll('select');
                let i = 0;
                selectBoxes.forEach((box) => {
                    correct = correctAnswers[i];
                    console.log(correct);
                    const selectedOption = box.options[correct].text + ' ';
                    selectedOptions = selectedOptions + selectedOption;
                    box.remove();
                    i+=1;
            });
            
            const checkButton = questionSection.querySelector('.check-button');
            const downloadButton = questionSection.querySelector('.download-button');
            if (checkButton) {
                checkButton.remove();
            }
            
            if (downloadButton) {
                downloadButton.remove();
            }

            }
            const successMessage = document.createElement('p');
            successMessage.textContent = '"' + selectedOptions.slice(0, -1) + '" is correct, well done!';
            questionSection.appendChild(successMessage);
        }
        console.log(receivedData);
      };
      
    
    const createSections = () => {
        const handleCheck = (questionIndex) => {
          const selectedOptions = [];
      
        
          for (let boxNumber = 1; boxNumber <= 3; boxNumber++) {
            const selectBox = document.querySelector(`#question-${questionIndex}-box-${boxNumber}`);
            const selectedIndex = selectBox.selectedIndex;
            selectedOptions.push(selectedIndex); 
          }
      
          const lobby = {
            lobbyCode: userData.lobbyCode,
            question: questionIndex, 
            answers: [selectedOptions],
          };
      
          stompClient.send('/app/lobby/update', {}, JSON.stringify(lobby));
        };
      
        return predefinedQuestions.map((question, index) => (
          <div key={index} id={`question-${index}`} className="question-section">
            <p>{question}</p>
            <a className = "download-button" href={`Images/${fileNames[index]}`} download={fileNames[index]}>Download</a>
            <div className="dropdown-container">
            <select id={`question-${index}-box-1`}>
              <option>Ruby Miller</option>
              <option>Violet Clark</option>
              <option>Jasper Green</option>
              <option>Hazel Carter</option>
              <option>Finn Brown</option>
              <option>The person by the door</option>
              <option>The person by the window</option>
              <option>The person at the bar</option>
              <option>The person sat outside</option>
              <option>The person by the fire</option>
              
            </select>
            <select id={`question-${index}-box-2`}>
              <option>sat</option>
              <option>did not sit</option>
              <option>ordered</option>
              <option>did not order</option>
            </select>
            <select id={`question-${index}-box-3`}>
              <option>by the door</option>
              <option>by the window</option>
              <option>at the bar</option>
              <option>outside</option>
              <option>by the fire</option>
              <option>a pint of fosters</option>
              <option>a cosmopolitan</option>
              <option>bottled water</option>
              <option>a rum and coke</option>
              <option>pork scratchings</option>
              
            </select>
      
            <button className="check-button" onClick={() => handleCheck(index)}>
              Check
            </button>
            </div>
          </div>
        ));
      };
      
    
    return (
        <div className ="container">
            {userData.connected?
            <div className = "lobby">
                <h1>The Crooked Pub</h1>

                <div className="lobbycode-section">
                    <p>Your lobby code is: {userData.lobbyCode}</p>
                </div>

                <p>Welcome to the case of The Crooked Pub!</p>
                <p>Five individuals were present at the night of the arson: 
                <span style={{color: 'red'}}>Ruby Miller</span>, 
                <span style={{color: 'green'}}> Jasper Green</span>, 
                <span style={{color: 'violet'}}> Violet Clark</span>, 
                <span style={{color: 'brown'}}> Hazel Carter</span> and 
                <span style={{color: '#964B00'}}> Finn Brown</span>.</p>
                
                <p>Each holds a piece to the puzzle. Uncover clues from the ten questions to reveal the truth behind the pub's fate.</p>

                <div className="joinedUsers-section">
                    <p>Your team: {lobbyMembers.join(', ')}</p>
                </div>

                {createSections()}
            </div>
            :
            <div className = "login">
            
                <div id="main">
                    <div id="title-block">
                        <h1>The Crooked Pub</h1>
                    </div>
                    <div id="button-block">
                        <input
                            type="text"
                            placeholder="Enter your name"
                            value={userData.username}
                            onChange={(e) => setUserData({...userData, "username": e.target.value}) }
                        />
                        <input
                            type="text"
                            placeholder="Enter lobby code"
                            value={userData.lobbyCode}
                            onChange={(e) => setUserData({...userData, "lobbyCode": e.target.value})}
                        />
                        <button type="button" onClick={createGame}>
                            Create New Game
                        </button>
                        <button type="button" onClick={joinGame}>
                            Join Game
                        </button>
                    </div>

                    <div id="how-to-play">
                        <p>How to play:</p>
                        <p>*Put game instructions here*</p>
                    </div>
                </div>
            </div>
            }
        </div> 
  )
}

export default Lobby