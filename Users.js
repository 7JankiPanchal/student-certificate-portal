import React, { useEffect, useState } from "react";

function Users() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/users")
      .then(res => res.json())
      .then(data => setUsers(data));
  }, []);

  return (
    <div>
      <h1>Users</h1>

      {users.map((user, index) => (
        <div key={index}>
          <p>ID: {user.user_id?.S}</p>
          <p>Name: {user.name?.S}</p>
          <p>Course: {user.course?.S}</p>
          <hr />
        </div>
      ))}
    </div>
  );
}

export default Users;