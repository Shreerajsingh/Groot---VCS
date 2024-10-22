# Groot - A Simple Version Control System

Groot is a lightweight and simplified version control system, similar to Git. It allows you to track changes in files, create commits, and view diffs between commits. This project is implemented in Node.js and aims to provide basic version control functionalities like initializing a repository, adding files, committing changes, and logging the history of commits.

## Features

- **Init Repository**: Create a new `.groot` repository in the current directory.
- **Add Files**: Add files to the staging area, ready to be committed.
- **Commit Changes**: Commit the staged files with a message.
- **Log Commits**: Display a list of all previous commits with their commit hash and messages.
- **Show Diffs**: View differences between the current and previous commits.

## Installation

To install and use Groot, you'll need to have [Node.js](https://nodejs.org/en/) installed on your system.

1. Clone this repository or download the source code.

    ```
    git clone https://github.com/Shreerajsingh/Groot-VCS.git
    cd groot
    ```

2. Install the required dependencies:

    ```
    npm install
    ```

3. Make the script executable:

    ```
    chmod +x Groot.mjs
    ```

## Usage

You can interact with Groot through various commands.

### 1. Initialize a Repository
   To initialize a new Groot repository in the current directory, run:
    
    ./Groot.mjs init
    
   This will create a .groot folder in your directory, containing the necessary files to manage the repository.

### 2. Add Files

   To add a file to the staging area, use the add command:
    
    ./Groot.mjs add <file-path>
  
   This stages the specified file and adds it to the index for committing.

### 3. Commit Changes

   To commit the staged files with a message, use the `commit` command:
    
    ./Groot.mjs commit "<commit message>"
    
   This commits all the files from the staging area with the provided commit message.

### 4. View Commit History

   To view the log of all commits, use the log command:
    
    ./Groot.mjs log
    
   This displays all previous commits, showing their commit hash, timestamp, and message.

### 5. Show Commit Differences

   To view the differences between a specific commit and its parent, use the show command:
    
    ./Groot.mjs show <commit-hash>
    
   This displays the file differences in the specified commit.


### Example:
   >Initialize the repository:
        ```./Groot.mjs init```        

   >Add files:
        ```./Groot.mjs add sample.txt```

   >Commit changes:
        ```./Groot.mjs commit "Initial commit"```

   >View commit log:
        ```./Groot.mjs log```

   >Show differences between commits:
        ```./Groot.mjs show <commit-hash>```


## Project Structure
Groot Class: Handles the core functionality of version control (init, add, commit, log, show).
Repository Setup: All repository data is stored in the .groot folder, including HEAD, index, and object files.
Diffing: The diffLines method from the diff library is used to display differences between file versions, highlighted with the chalk library.

## Dependencies
- **Node.js**: The runtime environment for executing JavaScript code.
- **crypto**: Used to generate file hashes.
- **diff**: Used to compute differences between text files.
- **chalk**: Provides colored terminal output.

### You can install the dependencies using:
```
npm install <dependency>
```

## Future Improvements
Implement branching and merging.
Add support for file deletions and renames.
Optimize storage with tree structures.
Provide better error handling and user feedback.
