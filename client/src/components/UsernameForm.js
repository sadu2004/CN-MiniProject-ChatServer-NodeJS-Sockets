import React from 'react';

// Component for the username input form
function Form(props) {
    return (
        // Form element with username input and connect button
        <form id="login">
            {/* Input field for entering username */}
            <input
                placeholder="Username..."
                type="text"
                value={props.username} // Current value of the username input
                onChange={props.onChange} // Event handler for input change
            />
            {/* Button to connect to the server */}
            <button onClick={props.connect}>Connect</button>
        </form>
    );
};

export default Form; // Export the Form component
