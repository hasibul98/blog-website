import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Navbar from "./Components/Navbar";
import Homepage from "./Components/Homepage";
import Blogs from "./Components/Blogs";
import AdminPanel from "./Components/AdminPanel";
import Profile from "./Components/Profile";
import Register from "./Components/Register";
import AuthorProfile from "./Components/AuthorProfile";
import SingleBlog from "./Components/SingleBlog"; // Import SingleBlog component
import "./styling/app.css";

function App() {
  return (
    <div className="app">
      <Router>
        <Navbar />
        <Switch>
          <Route path="/" component={Homepage} exact />
          <Route path="/blogs" component={Blogs} exact /> {/* Add exact to /blogs to prevent it from matching /blogs/:blogId */}
          <Route path="/blogs/:blogId" component={SingleBlog} /> {/* Add SingleBlog route */}
          <Route path="/admin" component={AdminPanel} />
          <Route path="/profile" component={Profile} />
          <Route path="/register" component={Register} />
          <Route path="/author/:authorId" component={AuthorProfile} />
        </Switch>
      </Router>
    </div>
  );
}

export default App;
