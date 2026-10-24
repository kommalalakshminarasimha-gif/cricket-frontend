import axios from "axios";

const cricketApi = axios.create({
    baseURL:"http://localhost:9999/cricket",
    headers : {
        "Content-Type": "application/json",
    },
});

export default cricketApi