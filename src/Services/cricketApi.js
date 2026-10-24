import axios from "axios";

const cricketApi = axios.create({
    baseURL: "https://crickbuzzservice.onrender.com/cricket",
    headers : {
        "Content-Type": "application/json",
    },
});

export default cricketApi