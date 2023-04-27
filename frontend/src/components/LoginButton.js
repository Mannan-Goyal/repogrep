import { config } from "../config";

const LoginButton = () => {
  function clickey() {
    window.location = `https://github.com/login/oauth/authorize?client_id=${config.github_client_id}&redirect_uri=${config.backend_url}/api/auth/github?path=/&scope=repo`;
  }
  return (
    <div className="flex w-100 h-screen justify-center items-center">
      <button
        onClick={clickey}
        className="py-2.5 px-5 mr-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
      >
        SignIn with GitHub
      </button>
    </div>
  );
};

export default LoginButton;
