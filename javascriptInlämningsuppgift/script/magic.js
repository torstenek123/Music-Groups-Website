
'use strict';
//imports musicservice from musicservice.js
import Musicservice from './musicService.js';
let service = new Musicservice();

let url = new URL(window.location);
let params = url.searchParams;
//different views
const _list = document.getElementById('list-of-items');

//search term filter init value is null
let filter = sessionStorage.getItem('filter')

//buttons
const btnNext = document.querySelector('#btnNext');
const btnPrev = document.querySelector('#btnPrev');
const btnSearch = document.querySelector('#btnSearch');
const searchInput = document.getElementById('searchInput');
const btnReturn = document.querySelector('#btnReturn');
const btnReturn2 = document.querySelector('#btnReturn2');
const darkmodeSwitch = document.querySelector("#darkmodeSwitch"); 
const btnHome = document.querySelector("#homeButton"); 
const pageButtons = document.querySelectorAll('a[data-id]');
const btnEditView = document.querySelector('#btn-edit-item');
const btnValidate = document.querySelector('#btnValidate');




//list paging
let currentPage = params.get('page') ?? sessionStorage.getItem('currentPage') ?? 0;
let maxNrPages =  Math.ceil(await service.getItemCount()/10);
console.log("max number of pages is: ",maxNrPages);

//updates page nav buttons to only show for available pages
pageButtons.forEach( (pageButton) => {
    if(pageButton.dataset.id < maxNrPages) pageButton.style.display = 'block';
    else pageButton.style.display = 'none'
    console.log(maxNrPages);
})

//darkmode stuff
let background = sessionStorage.getItem('background');
let darkmodeChecked = sessionStorage.getItem('darkmodeChecked');

//keeps darkmode during session
if(background) document.body.classList.add('bg-dark');
//keeps darkmode checkbox checked during session
if(darkmodeChecked && darkmodeSwitch) darkmodeSwitch.checked = true;


//set EventHandlers
if(btnNext) btnNext.addEventListener('click', clickNext);
if(btnPrev) btnPrev.addEventListener('click', clickPrev);
if(btnSearch) btnSearch.addEventListener('click', clickSearch);
if(btnReturn) btnReturn.addEventListener('click', () =>  window.location.href = `./barbone_p1.html?page=${currentPage}&filter=${filter}`);
if(btnReturn2) btnReturn2.addEventListener("click", () => window.location.href = `./barbone_p2.html?id=${params.get('id')}`);
if(btnHome) btnHome.addEventListener('click', () => sessionStorage.removeItem('filter') );
if(darkmodeSwitch) darkmodeSwitch.addEventListener('click', clickDarkmode);

//checks if updated item is valid format, updates database with new item
if(btnValidate) btnValidate.addEventListener('click', async () => {
    console.log('in validate');
    const newItem = await service.readItemDtoAsync(params.get('id'));
    const updatedItem = await service.readItemAsync(params.get('id'));
    console.log(newItem);

    const groupName = document.getElementById('groupName');
    const genre = document.getElementById('genre');
    const established = document.getElementById('established');
    const editedFirstLastNames = document.querySelectorAll('.editedFirstLastName');
    const editedGroupName = document.querySelectorAll('.editedGroupName');
    const editedReleaseYear = document.querySelectorAll('.editedReleaseYear');

    if(groupName.value) newItem.name = groupName.value;
    else {
        window.alert("groupname can't be empty");
        return;
    }
    switch(genre.value) {
        case 'Rock':
            newItem.genre = 0;
            break;
        case 'Blues':
            newItem.genre = 1;
            break;
        case 'Jazz':
            newItem.genre = 2;
            break;
        case 'Metall':
            newItem.genre = 3;
            break;
        default:
            window.alert(`\"${genre.value}\" is an invalid genre must be either Jazz, Rock, Metall or Blues`);
            genre.value = updatedItem.strGenre;
            return;
    }


    if(established.value) newItem.establishedYear = established.value;
    else{
        window.alert("established year cant be empty");
        return;
    }

    //2 below for loops are not functional ; some mismatch in properties I can't figure out
    let i = 0;
    for (const artist of updatedItem.artists) {
        //regex (/\s(.+)/g) splits string into 2 substrings on first whitespace
        const [firstName, lastName] = editedFirstLastNames[i].textContent.split(/\s(.+)/g);
        artist.firstName = firstName;
        artist.lastName = lastName;
        artist.musicGroupsId = updatedItem.musicGroupId;
        console.log(artist);
        await service.updateArtistAsync(artist.artistId, artist);
        i++;
    }
    let c = 0;
    for(const album of newItem.albums) {
        const name = editedGroupName[c].textContent;
        album.name = name;
        const releaseYear = editedReleaseYear[c].textContent;
        album.releaseYear = releaseYear;
        album.musicGroupId = newItem.musicGroupId;
        console.log(album);
        await service.updateAlbumAsync(album.albumId, album);
        c++;
    }
    console.log(newItem);
    await service.updateMusicGroupAsync(newItem.musicGroupId, newItem);

});

if(btnEditView) btnEditView.addEventListener('click', () => window.location.href = `./barbone_p3.html?id=${params.get('id')}`);

//resets listview to default value and adds back the page nav buttons
if(searchInput) searchInput.addEventListener('input', async (event) => {
    event.preventDefault();
    if (searchInput.value === '') {
    pageButtons.forEach( (pageButton) => pageButton.style.display = 'block')
    removeAllChildNodes(_list);
    maxNrPages = Math.ceil(await service.getItemCount()/10);
    console.log("max nr pages in input event", maxNrPages);
    currentPage = 0;
    listViewUpdate();
    }
})



//gives pagevalue to navigation buttons
if(pageButtons) pageButtons.forEach( pageButton => pageButton.addEventListener('click', (event)=> {
    event.preventDefault();
    removeAllChildNodes(_list);
    window.location = `./barbone_p1.html?page=${pageButton.dataset.id}&filter=${filter}`;
    listViewUpdate(pageButton.dataset.id);
    currentPage = pageButton.dataset.id;
    sessionStorage.setItem('currentPage', currentPage);
}));

//page initialization
if (params.has('page')){
    removeAllChildNodes(_list);
    listViewUpdate(currentPage); 
} 
else await detailedView(params.get('id'));


//clearing listview values
function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

//page nav forward button event
function clickNext (event)  {
    currentPage++;
    if (currentPage > maxNrPages-1) currentPage = maxNrPages-1;
    sessionStorage.setItem('currentPage', currentPage);
    window.location = `./barbone_p1.html?page=${currentPage}&filter=${filter}`;
};

//page nav backward button event
function clickPrev (event)  {
    currentPage--;
    if (currentPage < 0) currentPage = 0;
    sessionStorage.setItem('currentPage', currentPage);
    window.location = `./barbone_p1.html?page=${currentPage}&filter=${filter}`;
};

//search event 
async function clickSearch(event){
    event.preventDefault();
    removeAllChildNodes(_list);
    filter = searchInput.value;

    //saves filter to current session 
    sessionStorage.setItem('filter', filter);
    //passing undefined since i only want to use filter as argument
    await listViewUpdate(undefined, filter);
    maxNrPages = Math.ceil(await service.getItemCount()/10);
    console.log("max number of pages in searchEvent is: ",maxNrPages);
    window.location = `./barbone_p1.html?page=0&filter=${filter}`;
    //updates page nav buttons to only show for available pages
    pageButtons.forEach( (pageButton) => {
        if(pageButton.dataset.id < maxNrPages) pageButton.style.display = 'block';
        else pageButton.style.display = 'none'
        console.log(maxNrPages);
    });

}

//darkmode event
function clickDarkmode(event){
    const _body = document.body;
    
    if(darkmodeSwitch.checked === true){
        console.log("darkmode is on");
        sessionStorage.setItem('darkmodeChecked', true);
        sessionStorage.setItem('background','bg-dark');
        _body.classList.add('bg-dark');

    }
    else{
        console.log("darkmode is off");
        sessionStorage.removeItem('darkmodeChecked');
        sessionStorage.removeItem('background');
        _body.classList.remove('bg-dark');
    }
}
//calls on the musicservice function readFilterAsync to fetch musicgroups
//builds listview from each musicgroups name property, 
//adds <a> tag to each div with the href being page 2 with query param "id" with value of musicgroupId for the current musicgroup
async function listViewUpdate(pageNR=0, filter = sessionStorage.getItem('filter')){

    console.log('updating listview');
    console.log('page number is: ',pageNR);
    const promise = await service.readFilterAsync(filter, pageNR);
    const promiseArray = promise.pageItems;

    //creating links
    for (const item of promiseArray) {
        const div = document.createElement('div');
        div.classList.add('col-md-10', 'themed-grid-col');
        const a = document.createElement('a');

        a.href = `barbone_p2.html?id=${item.musicGroupId}`;
        a.text = item.name;

        div.appendChild(a);
        _list.appendChild(div);
    }
    //results paragraph
    const resultsCount = document.querySelector('#resultsCount');
    const searchFilter = (filter !== null && filter !== '') ? `matching the search criteria ${filter}` : '';
    resultsCount.innerHTML = `Database contains ${promise.dbItemsCount} music groups ${searchFilter}`;
}

//detailedView event
//calls on readItemAsync with musicGroupId  
//readItemAsync returns the object with the properties: name, strGenre, establishedYear, artists, albums, releaseYear
async function detailedView(ID){
    console.log("in detailedView");
    const albumsArtists = await service.readItemAsync(ID);

    //getting page elements
    const groupName = document.getElementById('groupName');
    const genre = document.getElementById('genre');
    const established = document.getElementById('established');
    const artists = document.getElementById('artists');
    const artistsEdit = document.getElementById('artistsEdit');
    const albums = document.getElementById('albums');
    const albumsEdit = document.getElementById('albumsEdit');
    const releaseYear = document.getElementById('releaseYear');


    //removing default values
    if(groupName)removeAllChildNodes(groupName);
    if(genre) removeAllChildNodes(genre);
    if(established)removeAllChildNodes(established);
    if(artists)removeAllChildNodes(artists);
    if(albums)removeAllChildNodes(albums);
    if(albumsEdit)removeAllChildNodes(albumsEdit);
    if(artistsEdit) removeAllChildNodes(artistsEdit);
    if(releaseYear) removeAllChildNodes(releaseYear);

    //setting some values
    groupName.value = albumsArtists.name;
    genre.value = albumsArtists.strGenre;
    established.value = albumsArtists.establishedYear;


    //for barbone_p2
    if(url.href.indexOf('p2') !== -1){
        console.log("page2 detailview")
        //filling artists listview
        for (const artist of albumsArtists.artists) {

            const div = document.createElement('div');
            div.classList.add('col-md-10', 'themed-grid-col');

            div.textContent = `${artist.firstName} ${artist.lastName}`;
            artists.appendChild(div);
        }

        //filling albums listview
        for (const album of albumsArtists.albums) {
            
            const div1 = document.createElement('div');
            const div2 = document.createElement('div');

            div1.classList.add('col-md-10', 'themed-grid-col');
            div2.classList.add('themed-grid-col', 'col-md-2', 'releaseYear');

            div1.textContent = album.name;
            div2.textContent = album.releaseYear;
            
            albums.appendChild(div1);
            releaseYear.appendChild(div2);
        }
    }
    //for page barbone_p3
    else if(url.href.indexOf('p3') !== -1){
        console.log("page 3 edit detailview")
        for (const artist of albumsArtists.artists) {

            const div = document.createElement('div');
            div.classList.add('col-md-10', 'themed-grid-col', 'editedFirstLastName');
            div.textContent = `${artist.firstName} ${artist.lastName}`;

            const input = document.createElement('input');
            input.classList.add('col-md-10', 'themed-grid-col');
            input.value = `${artist.firstName} ${artist.lastName}`

            //edit button - switches between <div> and <input> and button Ok and Edit
            const divEdit = document.createElement('div');
            divEdit.classList.add('col-md-2', 'themed-grid-col')
            const btnEdit = document.createElement('button');
            btnEdit.classList.add('btn', 'btn-secondary', 'btn-sm', 'm-1');
            btnEdit.type = 'button';
            btnEdit.textContent = 'Edit';
            btnEdit.addEventListener('click', () => {
                if(btnEdit.textContent === 'Edit'){
                    div.replaceWith(input);
                    btnEdit.textContent = 'Ok';
                }
                else{
                    const [firstName, lastName] = input.value.trim().split(/\s(.+)/g);
                    console.log(firstName, lastName);
                    if(isNaN(firstName) && isNaN(lastName) && input.value.trim().split(/\s(.+)/g).length > 1){
                        console.log("Valid name");
                        div.textContent = input.value;
                    }
                    else{
                        window.alert(`\"${input.value}\" is an invalid first and lastname`);
                        input.value = div.textContent;
                    }
                    input.replaceWith(div);
                    btnEdit.textContent = 'Edit';
                }
            });

            divEdit.appendChild(btnEdit);
            artistsEdit.appendChild(div);
            artistsEdit.appendChild(divEdit);
        }


        for (const album of albumsArtists.albums) {
            
            const div1 = document.createElement('div');
            const div2 = document.createElement('div');

            div1.classList.add('col-md-8', 'themed-grid-col', 'editedGroupName');
            div2.classList.add('themed-grid-col', 'col-md-2', 'editedReleaseYear');

            div1.textContent = album.name;
            div2.textContent = album.releaseYear;

            const input1 = document.createElement('input');
            input1.classList.add('col-md-8', 'themed-grid-col');
            input1.value = album.name;
            const input2 = document.createElement('input');
            input2.classList.add('col-md-2', 'themed-grid-col');
            input2.value = album.releaseYear;

            const divEdit = document.createElement('div');
            divEdit.classList.add('col-md-2', 'themed-grid-col')
            const btnEdit = document.createElement('button');
            btnEdit.classList.add('btn', 'btn-secondary', 'btn-sm', 'm-1');
            btnEdit.type = "button";
            btnEdit.textContent = "Edit";

            btnEdit.addEventListener('click', () => {
                if(btnEdit.textContent === 'Edit'){
                    div1.replaceWith(input1);
                    div2.replaceWith(input2);
                    btnEdit.textContent = 'Ok';
                }
                else{
                    const albumName = input1.value;
                    const albumReleaseYear = input2.value;
                    if(albumName !== '' && albumReleaseYear !== '' && !isNaN(albumReleaseYear)){
                        console.log("Valid name");
                        div1.textContent = input1.value;
                        div2.textContent = input2.value;

                    }
                    else{
                        window.alert(`\"${input1.value}\" and \"${input2.value}\" is invalid input for album name and release year`);
                        input1.value = div1.textContent;
                        input2.value = div2.textContent;
                    }
                    input1.replaceWith(div1);
                    input2.replaceWith(div2);
                    btnEdit.textContent = 'Edit';
                }
            });

            
            divEdit.appendChild(btnEdit);
            albumsEdit.appendChild(div1);
            albumsEdit.appendChild(div2);
            albumsEdit.appendChild(divEdit);

        }
        //<!-- This is the template for above for loop -->
        // <div class="row mb-2 text-center" id="albumsEdit">
        //     <div class="col-md-8 themed-grid-col">High Voltage</div>
        //     <div class="col-md-2 themed-grid-col">1975</div>
        //     <div class="col-md-2 themed-grid-col">
        //         <button class="btn btn-secondary btn-sm m-1" type="button">Edit</button>
        //     </div>  
        // </div>

    }

    if(currentPage>maxNrPages) currentPage = maxNrPages-1;
        
}