import { useEffect, useState } from "react";
import { config } from "../config";
import axios from "axios";

const Home = () => {
  const [user, setUser] = useState({});

  useEffect(() => {
    axios
      .get(`${config.backend_url}/api/auth/checkAuth`, {
        withCredentials: true,
      })
      .then((result) => {
        console.log(result);
        if (result.data === "You are not logged in") window.location = "/login";
        setUser(result.data);
      })
      .catch((error) => console.log(error));
  }, []);

  const logout = () => {
    axios.post(
      `${config.backend_url}/api/auth/logout`,
      {},
      { withCredentials: true }
    );
    window.location = "/login";
  };

  const sync = async (e) => {
    e.preventDefault();
    console.log("sync");
    await axios.post(
      `${config.backend_url}/repo/sync`,
      {},
      {
        withCredentials: true,
      }
    );
  };

  const backup = async (e) => {
    e.preventDefault();
    const url = document.getElementById("url").value;
    const vals = url.split("/");
    const repo_name = vals[vals.length - 1];
    const repo_owner = vals[vals.length - 2];
    const branch = document.getElementById("branch").value;
    const crontime = document.getElementById("crontime").value;
    await axios.post(
      `${config.backend_url}/repo/zip`,
      { repo_name, repo_owner, branch, crontime },
      { withCredentials: true }
    );
  };

  return (
    <>
      <div className="w-full flex flex-row justify-between">
        <div className="mt-2 ml-2 flex flex-row h-12">
          <img
            className="rounded-full w-12 h-12"
            src={user.avatar_url}
            alt="avatar"
          />
          <h1 className="flex px-2 items-center h-12">{user.login}</h1>
        </div>
        <button
          onClick={logout}
          className="mt-2 py-2.5 px-5 mr-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
        >
          Log Out
        </button>
      </div>
      <div>
        <div className="mt-72 flex flex-col justify-center items-center w-full">
          <input
            type="text"
            id="url"
            placeholder="URL"
            className="w-3/5 h-14 px-2 border border-gray-800 bg-white text-gray-800 focus:outline-none focus:bg-gray-50"
          />
          <input
            type="text"
            id="branch"
            placeholder="Branch"
            className="w-3/5 h-14 px-2 border border-gray-800 bg-white text-gray-800 focus:outline-none focus:bg-gray-50"
          />
          <input
            type="text"
            id="crontime"
            placeholder="* * * * *"
            className="w-3/5 h-14 px-2 border border-gray-800 bg-white text-gray-800 focus:outline-none focus:bg-gray-50"
          />
          <button
            onClick={backup}
            className="w-3/5 h-14 px-2 border border-gray-800 bg-white text-gray-800 hover:bg-gray-600 hover:text-white active:border-none"
          >
            BACKUP
          </button>
          <button
            onClick={sync}
            className="w-3/5 h-14 px-2 border border-gray-800 bg-white text-gray-800  hover:bg-gray-600 hover:text-white hover:border-none"
          >
            SYNC OLD BACKUPS
          </button>
        </div>
      </div>
    </>
  );
};

export default Home;
