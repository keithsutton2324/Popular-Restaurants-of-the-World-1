import { ChatEngine } from 'react-chat-engine';

import ChatFeed from './components/ChatFeed';
import LoginForm from './components/LoginForm';
import './App.css';
import NavBar from './components/NavBar';
import 'bootstrap/dist/css/bootstrap.min.css';

const projectID = '4039cfdb-77f0-412c-8278-623bfdbcb29c';

const App = () => {
  if (!localStorage.getItem('username')) return <LoginForm />;

  return (
    <div>
    <NavBar />
    <ChatEngine
      height="100vh"
      projectID={projectID}
      userName={localStorage.getItem('username')}
      userSecret={localStorage.getItem('password')}
      renderChatFeed={(chatAppProps) => <ChatFeed {...chatAppProps} />}
      onNewMessage={() => new Audio('https://chat-engine-assets.s3.amazonaws.com/click.mp3').play()}
    />
    </div>
  );
};



export default App;
