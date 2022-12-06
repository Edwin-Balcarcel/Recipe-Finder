function startApp(){

    const result = document.getElementById('resultado');

    const selectCategories = document.getElementById('categorias');

    if(selectCategories){
        selectCategories.addEventListener('change', selectCategory);
        getCategories();
    }

    const favoritesDiv = document.querySelector('.favoritos');
    if (favoritesDiv) {
        getFavorites();
    }
    
    const modal = new bootstrap.Modal('#modal', {});


    //take the JSON response from the API and send the categories to the showCategories function
    function getCategories(){
        const url = 'https://www.themealdb.com/api/json/v1/1/categories.php';
        fetch(url)
            .then(response => response.json())
            .then(result => showCategories(result.categories))
    }

    //get an array from the our function getCategories and show them in the select 
    function showCategories(categories = []){ 
        //we loop through our array to display each of the categories as an option
        categories.forEach(category => {
            const {strCategory} = category
            const option = document.createElement('OPTION');
            option.value = strCategory;
            option.textContent = strCategory;
            selectCategories.appendChild(option);

        })
    } 

    //send the array with recipes and the search category to the function that displays them
    function selectCategory(e){
        const category = e.target.value;
        const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`;
        fetch(url)
            .then(response => response.json())
            .then(result => showRecipes(result.meals, category))
    }

    function showRecipes(recipes = [], category){

        updateHTML(result);

        const favoritesText = 'Favorites';

        const heading = document.createElement('H2');
        heading.classList.add('text-center', 'text-black', 'my-5');
        heading.textContent = recipes.length ? `Results for ${category ?? favoritesText}` : `There are no results for this search`;
        result.appendChild(heading)

        //iterate over the results
        recipes.forEach(recipe => {
            const {idMeal, strMeal, strMealThumb} = recipe

            const recipContainer = document.createElement('DIV');
            recipContainer.classList.add('col-md-4')  

            const recipCard = document.createElement('DIV');
            recipCard.classList.add('card', 'mb-4');

            const recipImage = document.createElement('IMG');
            recipImage.classList.add('card-img-top');
            recipImage.alt = `${strMeal} image`;
            recipImage.src = strMealThumb ?? recipe.img; 

            const recipCardBody = document.createElement('DIV');
            recipCardBody.classList.add('card-body');

            const recipHeading = document.createElement('H3');
            recipHeading.classList.add('card-title', 'mb-3', 'text-center');
            recipHeading.textContent = strMeal ?? recipe.title;

            const recipButton = document.createElement('BUTTON');
            recipButton.classList.add('btn', 'btn-danger', 'w-100');
            recipButton.textContent = 'Show Recipe';
            // recipButton.dataset.bsTarget = '#modal';
            // recipButton.dataset.bsToggle = 'modal';
            recipButton.onclick = function(){
                selectRecipt(idMeal ?? recipe.id);
            }

            //add to html
            recipCardBody.appendChild(recipHeading);
            recipCardBody.appendChild(recipButton);

            recipCard.appendChild(recipImage);
            recipCard.appendChild(recipCardBody);

            recipContainer.appendChild(recipCard);

            result.appendChild(recipContainer);

        })
    }   

    function selectRecipt(id){
        const url = `https://themealdb.com/api/json/v1/1/lookup.php?i=${id}`
        fetch(url)
            .then(response => response.json())
            .then(result => showFullRecipt(result.meals[0]))
        
    }

    function showFullRecipt(recipe){
        const {idMeal, strInstructions, strMeal, strMealThumb} = recipe

        const modalTitle = document.querySelector('.modal .modal-title');
        const modalBody = document.querySelector('.modal .modal-body');

        
        modalTitle.textContent = strMeal;
        modalBody.innerHTML = `
            <img class="img-fluid" src="${strMealThumb}" alt="recipt ${strMeal}"/>
            <h3 class="my-3">Instructions</h3>
            <p>${strInstructions}<p/>

            <h3 class="my-3">Ingredients</h3>
        `;

        const listGroup = document.createElement('UL');
        listGroup.classList.add('list-group');

        for (let i = 1; i <= 20; i++) {
            if(recipe[`strIngredient${i}`]){
                const ingredient = recipe[`strIngredient${i}`];
                const lot = recipe[`strMeasure${i}`];
                 
                const ingredientLi = document.createElement('LI');
                ingredientLi.classList.add('list-group-item');
                ingredientLi.textContent = `${ingredient} - ${lot}`;

                listGroup.appendChild(ingredientLi);
            }
        }

        modalBody.appendChild(listGroup);

        const modalFooter = document.querySelector('.modal-footer');
        updateHTML(modalFooter);

        // btns modal
        const favoriteBtn = document.createElement('BUTTON');
        favoriteBtn.classList.add('btn', 'btn-danger', 'col');
        favoriteBtn.textContent = duplicateElements(idMeal) ? 'remove from favorites' : 'Add to Favorites';

        //local storage
        favoriteBtn.onclick = function(){

            if (duplicateElements(idMeal)) {
                deleteFavorite(idMeal);
                favoriteBtn.textContent = 'Add to Favorites';
                showToast('removed successfully');
                return;
            }

            addFavorite({
                id: idMeal,
                title: strMeal,
                img: strMealThumb
            })
            favoriteBtn.textContent = 'remove from favorites';
            showToast('added successfully');

        }

        const closeBtn = document.createElement('BUTTON');
        closeBtn.classList.add('btn', 'btn-secondary', 'col');
        closeBtn.textContent = 'Close';
        closeBtn.onclick = function(){
            modal.hide(); 
        }

        modalFooter.appendChild(favoriteBtn);
        modalFooter.appendChild(closeBtn);

        //show a modal window
        modal.show();
    }

    function addFavorite(recipe){
        const favorites = JSON.parse(localStorage.getItem('favorites')) ?? [];
        localStorage.setItem('favorites', JSON.stringify([...favorites, recipe]));

    }

    function deleteFavorite(id){
        const favorites = JSON.parse(localStorage.getItem('favorites')) ?? [];
        const newFavorites = favorites.filter(favorite => favorite.id !== id);

        localStorage.setItem('favorites', JSON.stringify(newFavorites));
    }

    function duplicateElements(id){
        const favorites = JSON.parse(localStorage.getItem('favorites')) ?? [];
        return favorites.some(favorite => favorite.id === id);
    }

    function showToast(message){
        const toastDiv = document.getElementById('toast');
        const toastBody = document.querySelector('.toast-body');
        const toast = new bootstrap.Toast(toastDiv);
        toastBody.textContent = message;
        toast.show()
    }

    function getFavorites(){

        const favorites = JSON.parse(localStorage.getItem('favorites')) ?? [];
        if (favorites.length){
            showRecipes(favorites);
            return;
        }

        const noFavorites = document.createElement('P');
        noFavorites.textContent = 'No Favorites Yet';
        noFavorites.classList.add('fs-4', 'text-center', 'font-bold', 'mt-5');

        result.appendChild(noFavorites);
    }

    function updateHTML(selector){
        while(selector.firstChild){
            selector.removeChild(selector.firstChild);
        }
    }
}

document.addEventListener('DOMContentLoaded', startApp);
