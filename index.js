const axios = require('axios');
const fs = require('fs');
const {promisify} = require('util');
fs.writeFile = promisify(fs.writeFile);
const default_user = {
    access_token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJTeW50YWN0aWNsb3N1cmUiLCJleHAiOjE1ODU2MzY1NDQ4MjcsInBsYXRmb3JtIjoiZ2l0aHViIiwiaWQiOjE1MzB9.n-7MvElrjLH9OAki4-7GaCJHQVQh-cNTVqAnVUv4WS4',
    uid: 1530
};
const api = axios.create({
    baseURL: 'https://api.smartsignature.io',
    headers: {
        Accept: '*/*',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36'
    }
})
async function getArticles(user) {
    try {
        const { access_token, uid } = user;
        const request = await api({
            url: `/posts/timeRanking`,
            params: {
                author: uid,
                pagesize: 9999999,
                extra: 'short_content',
                page: 1
            },
            method: 'GET'
        });
        return request.data.data.list;
    } catch (e) {
        console.log(`failling to get articles of user id ${uid}`);
    }
}

async function getArticle(user, hash) {
    try {
        const {access_token,uid} = user;
        const request = await api({
            url : `/post/ipfs/${hash}`,
            method : 'GET',
            headers : {
                'x-access-token' : access_token
            }
        });
        return request.data.data;
    } catch (e) {
        console.log(`failling to get article,hash = ${hash}`);
    }
}

async function downloadArticle(user,hash){
    const article = await getArticle(user,hash);
    try{
    const title = article.title.replace(/[^\w]/,'');
    await fs.writeFile(`./${title}.md`,article.content);
    }catch(err){
        console.log(`writing file to downloads failed. title : ${article.title}`);
        console.log(err);
    }
}

(async function(){
    const articles = await getArticles(default_user);
    Promise.all(articles.map(({hash}) => downloadArticle(default_user,hash)));
})();