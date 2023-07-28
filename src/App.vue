<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { MangaBackend, MangaChapter } from './assets/lib/Interfaces';
import * as bootstrap from 'bootstrap';

const search = ref('');

const infoBackend = ref<MangaBackend[]>([]);

async function sendData() {
    const response = await fetch('http://localhost:3000/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ search: search.value }),
    });

    const data = await response.json();

    infoBackend.value = data;

    infoBackend.value.forEach((item) => {
        if (item.title.length > 30) {
            item.title = item.title.slice(0, 30) + '...';
        }
    });
}

const selectedManga = ref<MangaBackend>();

function selectManga(item: MangaBackend) {
    selectedManga.value = item;
    sendSelectedManga();
}

const mangaChapters = ref<MangaChapter>();

async function sendSelectedManga() {
    try {
        const response = await fetch('http://localhost:3000/manga', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ link: selectedManga.value?.link }),
        });

        const data = await response.json();

        mangaChapters.value = data;
    } catch (error) {
        console.log(error);
    }
}

// Modal bootstrap
const modal = ref<bootstrap.Modal>();

function openModal() {
    modal.value?.show();
}

function closeModal() {
    modal.value?.hide();

    selectedManga.value = undefined;
    mangaChapters.value = undefined;
}

onMounted(() => {
    modal.value = new bootstrap.Modal(
        document.getElementById('exampleModal') as HTMLElement
    );
});
</script>

<template>
    <div class="container mt-5">
        <h1 class="text-center text-primary fw-bold">Buscador Manga</h1>
        <div class="d-flex justify-content-center align-items-center flex-column">
            <input
                type="text"
                v-model="search"
                placeholder="Busca tu manga favorito"
                class="form-control w-50"
                @keyup.enter="sendData" />
            <button @click="sendData" class="btn btn-primary mt-3 mb-3">
                Buscar
            </button>
        </div>

        <!-- Manga info -->
        <div v-if="infoBackend" class="row">
            <div v-for="item in infoBackend" :key="item.title" class="col-md-3 mb-3">
                <div class="card h-100" @click="openModal">
                    <img
                        :src="item.image"
                        :alt="item.title + ' image'"
                        @click="selectManga(item)"
                        class="card-img-top img-fluid rounded mx-auto mt-3" />
                    <div class="card-body">
                        <h5 class="card-title">{{ item.title }}</h5>
                        <a
                            :href="item.link"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="card-text text-primary fw-bold cursor-pointer">
                            Ver Manga en LeerCapitulo
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal -->

    <div
        class="modal fade"
        id="exampleModal"
        tabindex="-1"
        role="dialog"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5
                        v-if="mangaChapters?.mangaTitle"
                        class="modal-title"
                        id="exampleModalLabel">
                        Capítulos de <em>{{ mangaChapters?.mangaTitle }}</em>
                    </h5>

                    <h5 v-else class="modal-title" id="exampleModalLabel">
                        Cargando...
                    </h5>

                    <button
                        @click="closeModal"
                        type="button"
                        class="close"
                        data-dismiss="modal"
                        aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <!-- Chapters -->

                    <div v-if="mangaChapters" class="row">
                        <div class="row">
                            <div
                                v-for="(
                                    chapterTitle, index
                                ) in mangaChapters.chapters_titles"
                                :key="chapterTitle"
                                class="col-md-4 mb-3">
                                <div class="card">
                                    <div class="card-body">
                                        <h5 class="card-title">
                                            {{ chapterTitle }}
                                        </h5>
                                    </div>

                                    <div class="card-footer">
                                        <a
                                            :href="mangaChapters.chapters[index]"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            class="btn btn-primary">
                                            Leer Capítulo
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        v-else
                        class="d-flex justify-content-center align-items-center">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button
                        @click="closeModal"
                        type="button"
                        class="btn btn-secondary"
                        data-dismiss="modal">
                        Close
                    </button>
                    <button type="button" class="btn btn-primary">
                        Save changes
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Modal styles */
.modal {
    overflow-y: auto;
}

.modal-dialog {
    max-width: 80%;
    margin: 1.75rem auto;
}

.modal-body {
    max-height: calc(100vh - 210px);
    overflow-y: auto;
}

.modal-footer {
    display: flex;
    justify-content: space-between;
}

/* Card styles */
.card {
    cursor: pointer;
}

.card-img-top:hover {
    filter: brightness(0.8);
    transition: all 0.3s ease;
}
</style>
