import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { GroupResponse } from "@/interfaces/interface"

interface GroupState {
    activeGroup: GroupResponse | null
}

const initialState: GroupState = {
    activeGroup: null,
}

const groupSlice = createSlice({
    name: "group",
    initialState,
    reducers: {
        setActiveGroup: (state, action: PayloadAction<GroupResponse>) => {
            state.activeGroup = action.payload
        },
    },
})

export const { setActiveGroup } = groupSlice.actions
export default groupSlice.reducer