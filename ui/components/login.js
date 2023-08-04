import React, { useState } from 'react';
import axios from 'axios';

// async function createAccount({ username, phone }) {
//     try {
//         const url = "http://localhost:8080/users/create";
//         let result = await fetch(url, {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json"
//             },
//             body: JSON.stringify({ username, phone })
//         });
//         let data = result.json();
//         console.log(data)
//         return data;
//     } catch (e) {
//         Promise.reject(e)
//     }
// }

async function prepareRoom({ userId }) {
    await axios.get(`http://localhost:8080/rooms/prepare/${userId}`)
        .then(res => {
            console.log(res.data)
        })
        .catch(error => console.log(error));
}

// async function signIn({ phone }) {
//     try {
//         const url = "http://localhost:8080/users/phone/" + phone;
//         let result = await fetch(url);
//         let data = await result.json();
//         return data;
//     } catch (e) {
//         return Promise.reject(e);
//     }
// }

export default function Login({ show, setAuth, setLogin }) {
    const [isShowSigIn, setShowSignIn] = useState(false);

    const [user, setUser] = useState(false);

    const showSignIn = () => {
        setShowSignIn(prev => !prev)
    }

    const FormCreateUsername = ({ setAuth, setLogin }) => {
        const onCreateUsername = async (e) => {
            e.preventDefault();
            let username = e.target.username.value;
            let phone = e.target.phone.value;
            if (username === "" || phone === "") {
                return;
            }

            await axios.post(`http://localhost:8080/users/create`, { username, phone })
                .then(res => {
                    const auth = res.data;
                    let user_id = auth.id;
                    console.log(auth);
                    console.log(user_id)

                    setAuth(auth);
                    setLogin(true);

                    axios.get(`http://localhost:8080/rooms/prepare/${user_id}`)
                            .then(res => { console.log(res.data) })
                })
                .catch(error => console.log(error));

            alert("Account successfully created!");

        }

        return (
            <form action="" className="mt-4 space-y-2" onSubmit={onCreateUsername}>
                <div>
                    <label className="text-sm font-light">Username</label>
                    <input required type="text" name="username" placeholder="Jhon Doe"
                        className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600" />
                </div>

                <div>
                    <label className="text-sm font-light">Phone</label>
                    <input required type="text" name="phone" placeholder="+1111..."
                        className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600" />
                </div>

                <div className="flex items-baseline justify-between">
                    <button type="submit"
                        className="px-6 py-2 mt-4 text-white bg-violet-600 rounded-lg hover:bg-violet-700 w-full">Create</button>
                </div>

                <div className="pt-2 space-y-2 text-center">
                    <p className="text-base text-gray-700">Already have a username? <button onClick={showSignIn} className="text-violet-700 font-light">Sign In</button></p>
                </div>
            </form>
        )
    }

    const FormSignIn = ({ setAuth, setLogin }) => {
        const onSignIn = async (e) => {
            e.preventDefault();
            let phone = e.target.phone.value;
            if (phone === "") {
                alert(`Phone number not found ${phone}`);
                return;
            }

            await axios.get(`http://localhost:8080/users/phone/${phone}`)
                .then(res => {
                    const auth = res.data;
                    console.log(auth);
                    setAuth(auth);
                    setLogin(true);
                })
                .catch(error => console.log(error));
        }

        return (
            <form action="" className="mt-4 space-y-2" onSubmit={onSignIn}>
                <div>
                    <label className="text-sm font-light">Phone</label>
                    <input required type="text" name="phone" placeholder="+1111..."
                        className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600" />
                </div>

                <div className="flex items-baseline justify-between">
                    <button type="submit"
                        className="px-6 py-2 mt-4 text-white bg-violet-600 rounded-lg hover:bg-violet-700 w-full">Submit</button>
                </div>

                <div className="pt-2 space-y-2 text-center">
                    <p className="text-base text-gray-700">Don't have username? <button onClick={showSignIn} className="text-violet-700 font-light">Create</button></p>
                </div>
            </form>
        )
    }

    return (
        <div className={`${show ? '' : 'hidden'} bg-gradient-to-b from-orange-400 to-rose-400`}>
            <div className="flex items-center justify-center min-h-screen">
                <div className="px-8 py-6 mt-4 text-left bg-white  max-w-[400px] w-full rounded-xl shadow-lg">
                    <h3 className="text-xl text-slate-800 font-semibold">{isShowSigIn ? 'Log in with your phone.' : 'Create your account.'}</h3>
                    {isShowSigIn ? <FormSignIn setAuth={setAuth} setLogin={setLogin} /> : <FormCreateUsername setAuth={setAuth} setLogin={setLogin} />}
                </div>
            </div>
        </div>
    )
}
