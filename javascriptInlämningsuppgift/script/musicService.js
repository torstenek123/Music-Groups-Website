'use strict';
//musicservice
export default Musicservice;
function Musicservice(URL = 'https://appmusicwebapinet8.azurewebsites.net/api/csMusicGroups/'){
    this.baseURL = URL;

    this.getItemCount = async () => {
    const promise = await this.readFilterAsync();
    return promise.dbItemsCount;
    }

    this.readItemAsync = async (ID) => await this.fetchApiData(`${this.baseURL}ReadItem?id=${ID}&flat=false`);
    this.readItemDtoAsync = async (ID) => await this.fetchApiData(`${this.baseURL}ReadItemDto?id=${ID}&flat=false`);
    this.readAsync = async (pageNR = 0) => await this.fetchApiData(`${this.baseURL}Read?flat=true&pageNr=${pageNR}&pageSize=10`);

    //calls on readAsync if no filter is passed
    this.readFilterAsync = async (filter = sessionStorage.getItem('filter'), pageNR = 0) => {
        if(filter === null) return await this.readAsync(pageNR);
        else return await this.fetchApiData(`${this.baseURL}Read?flat=true&filter=${filter}&pageNr=${pageNR}&pageSize=10`);
    }
    this.updateAlbumAsync = async(ID, updatedItem) => await this.fetchApiData(`https://appmusicwebapinet8.azurewebsites.net/api/csAlbums/UpdateItem/${ID}`, 
    'PUT', updatedItem);
    this.updateArtistAsync = async(ID, updatedItem) => {await this.fetchApiData(`https://appmusicwebapinet8.azurewebsites.net/api/csArtists/UpdateItem/${ID}`, 
    'PUT', updatedItem);
    console.log(updatedItem);
    } 
    this.updateMusicGroupAsync = async(ID, updatedItem) => await this.fetchApiData(`${this.baseURL}/UpdateItem/${ID}`, 'PUT', updatedItem);


    this.fetchApiData = async function(URL, method = null, body = null){
        try{
            console.log(`fetching response from ${URL}`)
            let response;
            if(method === null){
                response = await fetch(URL);
            }
            else{
                response = await fetch(URL, {
                    method: method,
                    headers: { 'content-type': 'application/json' },
                    body: body ? JSON.stringify(body) : null 
                })
            } 
            const obj = await response.json();
            return obj;
    
        }catch(error){
            console.error(error);
        }
    }
}