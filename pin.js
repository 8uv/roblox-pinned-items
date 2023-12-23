const waitForLoad = setInterval(() => {
    if(document.querySelectorAll(".active")[0].querySelectorAll("img")[0].src.includes("tr.rbxcdn")) {
        clearInterval(waitForLoad)

        setTimeout(() => {

            let items = 0

            let hovered = null // current hovered item
            let pinned = [] // array of ids of all pinned items
            let pinnedNames = []
            let pinnedThumbs = []

            let avatarData = null
            let checkingData = false

            // localstorage handling

            if(localStorage.getItem("stored-pins") != null) {
                const storedIDs = localStorage.getItem("stored-pins").split(",")
                for(pin in storedIDs) {
                    if(storedIDs[pin] != "") {
                        pinned.push(storedIDs[pin])
                    }
                }
            }

            if(localStorage.getItem("stored-names") != null) {
                const storedNames = localStorage.getItem("stored-names").split(",")
                for(n in storedNames) {
                    if(storedNames[n] != "") {
                        pinnedNames.push(storedNames[n])
                    }
                }
            }

            if(localStorage.getItem("stored-thumbnails") != null) {
                const storedThumbs = localStorage.getItem("stored-thumbnails").split(",")
                for(thumb in storedThumbs) {
                    if(storedThumbs[thumb] != "") {
                        pinnedThumbs.push(storedThumbs[thumb])
                    }
                }
            }

            // conversion functions

            const elToID = el => {
                return el.querySelectorAll(".item-card-thumb-container")[0].getAttribute("href").split("/")[4]
            }

            const elToName = el => {
                return el.querySelectorAll(".item-card-name")[0].innerHTML
            }

            const elToThumb = el => {
                return el.querySelectorAll("img")[0].getAttribute("src")
            }

            const IDtoEl = id => {
                let result = null
                items.forEach(el => {
                    if(id == el.querySelectorAll(".item-card-thumb-container")[0].getAttribute("href").split("/")[4]) {
                        result = el
                    }
                })

                return result
            }

            const pinIDtoEl = id => {
                let result = null
                document.querySelectorAll(".pin-li").forEach(el => {
                    if(id == el.querySelectorAll(".item-card-thumb-container")[0].getAttribute("href").split("/")[4]) {
                        result = el
                    }
                })

                return result
            }


            // ------

            const createPin = el => {
                const pin = document.createElement("img")
                pin.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' height='24' width='18' viewBox='0 0 384 512'%3E%3C!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2023 Fonticons, Inc.--%3E%3Cpath fill='%2300ff80' d='M32 32C32 14.3 46.3 0 64 0H320c17.7 0 32 14.3 32 32s-14.3 32-32 32H290.5l11.4 148.2c36.7 19.9 65.7 53.2 79.5 94.7l1 3c3.3 9.8 1.6 20.5-4.4 28.8s-15.7 13.3-26 13.3H32c-10.3 0-19.9-4.9-26-13.3s-7.7-19.1-4.4-28.8l1-3c13.8-41.5 42.8-74.8 79.5-94.7L93.5 64H64C46.3 64 32 49.7 32 32zM160 384h64v96c0 17.7-14.3 32-32 32s-32-14.3-32-32V384z'/%3E%3C/svg%3E"
                pin.style.margin = "8px 0 0 8px"
                pin.style.float = "left"
                pin.style.transform = "rotate(30deg)"

                const container = document.createElement("div")
                container.className = "item-card-equipped pin-div"
                container.style.background = "transparent"
                el.querySelectorAll(".item-card-caption")[0].appendChild(container)

                container.appendChild(pin)
            }

            const createCheck = el => {
                const box = document.createElement("div")
                box.className = "item-card-equipped"
                el.querySelectorAll(".item-card-caption")[0].appendChild(box)

                const tick = document.createElement("span")
                tick.className = "icon-check-selection"
                box.appendChild(tick)
            }

            const updateThumbail = () => {
                const userID = document.getElementById("nav-profile").getAttribute("href").split("/")[4]
                $.get(`https://thumbnails.roblox.com/v1/users/avatar?userIds=${userID}&size=352x352&format=Png&isCircular=false`, res => {
                    const th = res.data[0].imageUrl
                    document.getElementById("UserAvatar").querySelectorAll("img")[0].src = th
                })
            }

            const createPinnedLI = id => {
                const pane = items[1].cloneNode(true)
                pane.setAttribute("hasEventListener", "false")
                pane.className += " pin-li"

                pane.querySelectorAll(".item-card-equipped").forEach(el => el.remove())

                const ref = pane.querySelectorAll(".item-card-thumb-container")[0]
                ref.setAttribute("href", ref.getAttribute("href").replace(elToID(pane), id))

                if(avatarData) {
                    for(i in avatarData.assets) {
                        if(avatarData.assets[i].id.toString() == id) {
                            createCheck(pane)
                        }
                    }
                }

                document.querySelectorAll("#pinned-items")[0].appendChild(pane)
                pane.querySelectorAll(".item-card-name")[0].innerHTML = pinnedNames[pinned.indexOf(id)]
                pane.querySelectorAll("img")[0].src = pinnedThumbs[pinned.indexOf(id)]
                pane.querySelectorAll(".item-card-thumb-container")[0].style.pointerEvents = "none"

                pane.addEventListener("click", () => {
                    let found = false
                    for(i in avatarData.assets) {
                        if(avatarData.assets[i].id.toString() == id) {
                            avatarData.assets.splice(avatarData.assets.indexOf(avatarData.assets[i]), 1)
                            found = true
                        }
                    }

                    if(found == false) {
                        avatarData.assets.push({id: id})
                        $.post(`https://avatar.roblox.com/v2/avatar/set-wearing-assets`, {
                            "assets": avatarData.assets
                        }).then(() => updateThumbail())

                        createCheck(pane)
                        createCheck(IDtoEl(elToID(pane)))
                    } else {
                        if(avatarData.assets.length == 0) {
                            $.post(`https://avatar.roblox.com/v1/avatar/assets/${id}/remove`)
                                .then(() => updateThumbail())
                        } else {
                            $.post(`https://avatar.roblox.com/v2/avatar/set-wearing-assets`, {
                                "assets": avatarData.assets
                            }).then(() => updateThumbail())
                        }

                        pane.querySelectorAll(".item-card-equipped").forEach(box => box.remove())
                        IDtoEl(elToID(pane)).querySelectorAll(".item-card-equipped").forEach(box => box.remove())
                    }
                })
            }

            // updating logic 

            const refreshPins = () => {
                document.querySelectorAll(".active").forEach(el => { // get the parent ul of all the items
                    if(el.querySelectorAll("li").length > 0) { // there can be multiple of these so verification has to be done
                        items = el.querySelectorAll("li")
                    }
                })

                document.querySelectorAll(".item-card").forEach(el => { // create eventlisteners to check the currently hovered list element
                    if(el.getAttribute("hasEventListener") != "true") {
                        el.setAttribute("hasEventListener", "true")

                        el.addEventListener("mouseenter", () => {
                            console.log("hovered" + el)
                            hovered = el
                        })
                    
                        el.addEventListener("mouseleave", () => {
                            console.log("unhovered" + el)
                            hovered = null
                        })
                    }
                })

                items.forEach(el => {
                    if(el.getAttribute("hasEventListener") != "true") {
                        el.setAttribute("hasEventListener", "true")

                        el.addEventListener("click", () => {
                            let found = false
                            for(i in avatarData.assets) {
                                if(avatarData.assets[i].id.toString() == elToID(el)) {
                                    found = true
                                    avatarData.assets.splice(avatarData.assets.indexOf(avatarData.assets[i]), 1)

                                    for(i in pinned) {
                                        if(pinned[i] == elToID(el)) {
                                            pinIDtoEl(pinned[i]).querySelectorAll(".item-card-equipped").forEach(box => box.remove())
                                        }
                                    }
                                }
                            }

                            if(found == false) {
                                avatarData.assets.push({id: parseInt(elToID(el))})
                                for(i in pinned) {
                                    if(pinned[i] == elToID(el)) {
                                        createCheck(pinIDtoEl(pinned[i]))
                                    }
                                }
                            }
                        })
                    }
                })

                if(document.querySelectorAll("#pinned-items")[0] == undefined) {
                    const pinnedContainer = document.createElement("ul")
                    pinnedContainer.id = "pinned-items"
                    pinnedContainer.className = "hlist item-cards-stackable"
                    pinnedContainer.style.trasition = "height .25s"
                    document.querySelectorAll(".tab-content")[1].prepend(pinnedContainer)
                }

                if(document.querySelectorAll(".pin-li").length == 0 && pinned.length != 0 && checkingData == false) {
                    checkingData = true
                    $.get("https://avatar.roblox.com/v2/avatar/avatar", res => {
                        avatarData = res
                        for(pin in pinned) {
                            createPinnedLI(pinned[pin])
                        }  
                        checkingData = false
                    })
                }

                for(pin in pinned) {
                    let exists = false // check if the pinned item exists on the current page to avoid errors
                    items.forEach(el => {
                        if(pinned[pin] == elToID(el)) { // compare the pin id with element id
                            exists = true
                        }
                    })

                    if(exists == true && IDtoEl(pinned[pin]).querySelectorAll(".pin-div")[0] == undefined) { // create pin if it exists and doesnt already have one
                        console.log(pinned[pin])
                        console.log(IDtoEl(pinned[pin]))
                        createPin(IDtoEl(pinned[pin]))
                    }
                }
            }

            setInterval(refreshPins, 50)

            // ------

            document.addEventListener("keydown", e => {
                if(e.key == "p") {
                    const current = hovered

                    if(pinned.includes(elToID(current))) {
                        pinned.splice(pinned.indexOf(elToID(current)), 1)
                        pinnedNames.splice(pinnedNames.indexOf(elToName(current)), 1)
                        pinnedThumbs.splice(pinnedThumbs.indexOf(elToThumb(current)), 1)
                        console.log("removed!")
                
                        if(current.querySelectorAll("pin-div").length > 0) {
                            current.querySelectorAll(".pin-div")[0].remove()
                        }

                        if(IDtoEl(elToID(current)).querySelectorAll(".pin-div").length > 0) {
                            IDtoEl(elToID(current)).querySelectorAll(".pin-div").forEach(el => el.remove())
                        }
                
                        localStorage.setItem("stored-pins", pinned)
                        localStorage.setItem("stored-names", pinnedNames)
                        localStorage.setItem("stored-thumbnails", pinnedThumbs)
                
                        // document.querySelectorAll(".pin-li").forEach(el => {
                        //     el.style.opacity = 0
                        //     setTimeout(() => {el.remove()}, 75)
                        // })
                        document.querySelectorAll(".pin-li").forEach(el => {
                            if(elToID(el) == elToID(current)) {
                                el.remove()
                            }
                        })
                    } else {
                        pinned.push(elToID(current))
                        pinnedNames.push(elToName(current))
                        pinnedThumbs.push(elToThumb(current))
                        console.log("added!")
                
                        createPin(current)
                
                        localStorage.setItem("stored-pins", pinned)
                        localStorage.setItem("stored-names", pinnedNames)
                        localStorage.setItem("stored-thumbnails", pinnedThumbs)
                
                        createPinnedLI(elToID(current))
                    }
                }
            })
        }, 1500)
    }
}, 100)